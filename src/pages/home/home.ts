import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import * as utmObj from 'utm-latlng';
import { AlertPage } from '../alert/alert';
import { OfflinePage } from '../offline/offline';
import { AndroidPermissions } from '@ionic-native/android-permissions';
//var utmObj = require('utm-latlng');

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map') mapElement: any;
  @ViewChild('alertButton') alertButton: any;
  @ViewChild('openButton') openButton: any;
  addressElement: HTMLInputElement = null;

  map: any;
  loading: any;
  error: any;
  currentregional: any;
  MYLOC: any;
  keypadInput: any;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: App,
    public nav: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    // public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public geolocation: Geolocation,
    public http: Http,
    private androidPermissions: AndroidPermissions
  ) {
    this.keypadInput = "";
    this.platform.ready().then(() => {
      this.resolvePermissions().then(() => {
        console.log("Permissions working");
        this.loadMaps();
        this.loadMarkers();
      }).catch(err => console.error(err.message));
    });
  }

  getCoordinates(x) {
    return new google.maps.LatLng(x.geometry.coordinates[1], x.geometry.coordinates[0]);
  }

  loadMarkers() {

    // http://opendata.br7.org.il/datasets/geojson/street_light.geojson
    // http://opendata.br7.org.il/datasets/geojson/cameras.geojson
    let load = (name: string): Promise<{}> => {
      return new Promise<{}>(resolve => {
        this.http.get(`http://opendata.br7.org.il/datasets/geojson/${name}.geojson`).subscribe(data => {

          let r = JSON.parse(data["_body"])["features"];
          if (!Array.isArray(r)) { throw "Data downloaded is not array"; }

          for (let item in r) {
            if (r[0].type !== "Feature") {
              throw "Validation failed";
            }
          }

          if (!r.hasOwnProperty("length")) {
            throw "Validation failed";
          }
          console.log(`Downloaded items from ${name}`);
          resolve(r);
        });
      });
    };

    load("streetlight_epsg4326").then(heatmapData => {
      this.showToast("Loaded street lights");
      console.log("Loaded street lights");

      var data = [];
      for (var key in heatmapData) {
        data.push(this.getCoordinates(heatmapData[key]));
      }
      console.log("Processed coordinates", data);

      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: data,
        gradient: ["rgba(0,0,0,0)", "rgba(253, 251, 149, 0.9)"],
        maxIntensity: 1
      });
      console.log("Generated heatmap", heatmap);
      heatmap.setMap(this.map);
    });

    load("cameras").then(d => {
      this.showToast("Loaded security cameras");
      console.log("Loaded security cameras");
      for (var i = 0; i < d["length"]; i++) {
        let item = d[i];
        this.placeMarker({
          "lat": item.properties.Y,
          "long": item.properties.X,
          "title": "Camera",
          "url": "../../assets/icon/camera-32.png",
          "size": {
            "x": 32,
            "y": 32
          }
        });
      }
      console.log("Placed all cameras");
    });
  }

  loadMaps() {
    if (google) {
      console.log("init map");
      this.initializeMap();
    } else {
      console.error("internet");
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }

  initializeMap() {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        // zoom: 10,
        center: { lat: 34.7915, lng: 31.2530 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }
        ],
        disableDoubleClickZoom: false,
        disableDefaultUI: true,
        zoomControl: false,
        scaleControl: false,
      });
      console.log("Spawned map")
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        console.log("Map idle");
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
        this.bounceMap([]);
        // this.getCurrentPositionfromStorage(markers)
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        console.log("Bounds changed");
        this.zone.run(() => {
          this.resizeMap();
        });
      });

      try {
        let watch = this.geolocation.watchPosition();
        //console.log("Watching position", watch);
        //watch.subscribe(data => this.moveTo(data));
        this.geolocation.getCurrentPosition()
          .then(data => this.moveTo(data))
          .catch(err => console.error(err));
      }
      catch (e) {
        this.showToast("Unable to pan to location");
        console.error(e);
      }

      var icon = {
        url: '../../assets/icon/myLocation.png', // url
        scaledSize: new google.maps.Size(32, 32), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
      };
      this.MYLOC = new google.maps.Marker({
        clickable: false,
        icon: icon,
        shadow: null,
        zIndex: 999,
        map: this.map// your google.maps.Map object
      });
      console.log("Placed the 'my location' marker", this.MYLOC);
    });
  }

  lastPos: any;

  moveTo(data) {
    console.log("Moving to position");
    if (data == {}) {
      console.log("Data unavaliable", data);
      return;
    }
    /*if (this.lastPos == data){
      console.log("Skip");
      return;
    }
    else{
      this.lastPos = data;
    }*/
    try {
      let lg = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      const beerSheva = new google.maps.LatLng(31.2530, 34.7915);

      let action = () => {
        console.log("Try move");
        this.map.setZoom(20);
        this.map.panTo(lg);
        this.MYLOC.setPosition(lg);

        function deg2rad(deg) {
          return deg * (Math.PI / 180)
        }

        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
          var R = 6371; // Radius of the earth in km
          var dLat = deg2rad(lat2 - lat1);  // deg2rad below
          var dLon = deg2rad(lon2 - lon1);
          var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = R * c; // Distance in km
          return d;
        }
        let d = getDistanceFromLatLonInKm(lg.lat(), lg.lng(), beerSheva.lat(), beerSheva.lng());
        console.log("Testing distance from home", d);
        if (d > 5) {
          //this.errorAlert("Error", "");
          this.alertCtrl.create({
            "title": "Out of range",
            "subTitle": "This app was only meant to work in Be'er Sheva, some features may not apply",
            "buttons": [
              {
                text: "Ok"
              },
              {
                text: "Close app",
                handler: () => {
                  console.log("Exit app");
                  this.platform.exitApp();
                }
              }
            ]
          }).present();
        }
      };
      let test = () => {
        let mapLat = this.map.getCenter().lat();
        let mapLng = this.map.getCenter().lng();
        let myLat = lg.lat();
        let myLng = lg.lng();

        let t = (n) => { return 0 < Math.abs(n) && Math.abs(n) < 0.001; };

        let r = t(mapLat - myLat) && t(mapLng - myLng);
        console.log("Testing movement success", r);
        return r;
      }

      let t = () => {
        setTimeout(() => {
          console.log("Trying");
          if (!test()) {
            action();
            t();
          }
        }, 500);
      }
      t();
    }
    catch (e) {
      console.error(e.message);
    }

    console.log({
      "zoom": this.map.getZoom(),
      "location": {
        "lat": this.map.getCenter().lat(),
        "lng": this.map.getCenter().lng()
      },
      "data": data
    });
  }


  placeMarker(options) {
    var marker = new google.maps.Marker({
      map: this.map,
      position: { lat: options.lat || 0, lng: options.long || 0 },
      title: options.title || "",
      icon: {
        url: options.url,
        size: new google.maps.Size(options.size.x, options.size.y),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(options.size.x / 2, options.size.y)
      }
    });
  }

  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.loadMaps();
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    console.log("Loaded home page");
  }
  //Center zoom
  //http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
  bounceMap(markers) {
    let bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  alertOpen(event) {
    console.log("Alert open");
    //this.alertButton.classList.toggle("invisible");
    //this.openButton.classList.toggle("invisible");
    this.alertButton.setElementClass("invisible", false);
    this.openButton.setElementClass("invisible", true);
  }

  alert_start(event) {
    //this.showToast("Start");
    event.target.classList.toggle("pressDown", true);
    event.target.innerText = "Armed";

    console.log("Alert started", event.target.className);
  }

  alert_end(event) {
    //this.showToast("End");
    event.target.classList.toggle("pressDown", false);
    event.target.innerText = "Idle";
    console.log("Alert ended");
    this.nav.push(AlertPage);
  }

  resolvePermissions() {
    console.log("Testing permissions")
    var ps = [];

    let one = (name) => {
      console.log(`Permission ${name}`);
      let t = this.androidPermissions.checkPermission(name);
      ps.push(t);
      return t;
    };

    const permissions = [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_LOCATION_EXTRA_COMMANDS",
      "CONTROL_LOCATION_UPDATES",
      "LOCATION_HARDWARE",
      "INTERNET",
      "SEND_SMS",
      "VIBRATE"
    ];

    this.androidPermissions.requestPermissions(permissions).then(d => {
      for (let key in permissions) {
        let item = permissions[key];
        one(item).then(d => console.log(item, d)).catch(e => console.error(item, e.message));
      }
    });

    return Promise.all(ps);
  }
}
