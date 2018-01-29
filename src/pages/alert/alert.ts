import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration';
import { SMS } from '@ionic-native/sms';
import { HomePage } from '../home/home';
import { AppPreferences } from '@ionic-native/app-preferences';
import { SettingsPage } from '../settings/settings';
import { Geolocation } from '@ionic-native/geolocation';

/**
 * Generated class for the AlertPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-alert',
  templateUrl: 'alert.html',
})
export class AlertPage {
  @ViewChild('keyPadStatus') keyPadStatus: ElementRef;
  @ViewChild('keyPad') keyPad: ElementRef;

  keypadInput: string;
  alertCountDown: number;
  alertCountTimeout: any;

  settings: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private vibration: Vibration,
    private sms: SMS,
    private appPreferences: AppPreferences,
    private alertCtrl: AlertController,
    public geolocation: Geolocation
  ) {
    this.settings = {};
    let ps = [];
    let loadOne = (name, spot, def) => {
      console.log(`Loading ${name} to ${spot}`);
      let t = this.appPreferences.fetch(name).then(d => { this.settings[spot] = d /*|| def*/; });
      ps.push(t);
      return t;
    }

    loadOne("Passcode", "pass", "1234");
    loadOne("Keypad Timeout", "timeout", "5");
    loadOne("Emergency Contact Number", "phone", "");
    loadOne("Custom message", "message", "Help me");
    loadOne("Send location", "sendLocation", true);

    Promise.all(ps).then(d => {
      let allowContinue = true;
      for (let key in this.settings){
        if (this.settings[key] === undefined){
          console.log("User failed to fill out settings");
          this.switchToSettings("You seem to have not filled out some settings. Would you like to do that now to enable this feature?");
          allowContinue = false;
          return;
        }
      }

      if (allowContinue){
        this.alertCountDown = this.settings.timeout;
        this.alertCountTimeout = setInterval(() => {
          if (--this.alertCountDown >= 1) {
            console.log("Time in");
            this.onTimeIn();
          }
          else {
            console.log("Time out");
            clearInterval(this.alertCountTimeout);
            this.onTimeOut();
          }
        }, 1000);
      }

    }).catch(d => { console.error(d); });

    this.keypadInput = "";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlertPage');
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  sendKey(n): void {
    //this.keyPadStatus.innerText += "●";
    this.keypadInput += "" + n;
    console.log("Key press", this.keypadInput);

    if (this.keypadInput == this.settings.pass) {
      console.log("Disarming");
      clearInterval(this.alertCountTimeout);
      this.presentAlert("Alert", "Disarmed text");
      this.navCtrl.push(HomePage);
    }
  }

  onTimeIn() {
    console.log("Vibrate");
    this.vibration.vibrate(500);
  }

  onTimeOut() {
    let send = (m) => {
      this.sms.send(this.settings.phone, m)
        .then(d => { console.log("Success", d); })
        .catch(e => {
          this.presentAlert("Text error", "Unable to send text");
          console.error("Failure", e);
         });
    };

    console.log("Sending main text");
    send('**SOS**\nYou have received this message because I am currently in destress\n\n\"' + this.settings.message + "\"")

    if(this.settings.sendLocation){
      console.log("Sending current location");
      this.geolocation.getCurrentPosition().then(data => {
        send(`Here's my current location\n\nhttp://www.google.com/maps/place/${data.coords.latitude},${data.coords.longitude}`);
      })
    }
    console.log("Wrapping up");
    this.presentAlert("Alert", "Emergency text sent to " + this.settings.phone);
    this.navCtrl.push(HomePage);
  }

  presentAlert(title, body) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: body,
      buttons: ['Dismiss']
    });
    console.log("Presenting alert", [title, body]);
    alert.present();
  }

  switchToSettings(problem){
    let alert = this.alertCtrl.create({
      title: "Missing setting",
      subTitle: problem,
      buttons: [{
        text : "Go to settings",
        role : "cancel",
        handler : () => {
          this.navCtrl.push(SettingsPage);
        }
      }]
    });
    console.log("Asked to switch to settings");
    alert.present();
  }
}
