import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as marked from 'marked';
import { Http } from '@angular/http';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';

//declare var marked : any;

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  //https://rawgit.com/HIQUALITYSTARTUPAFLIT/safe-7/master/README.md

  @ViewChild('output') output : any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
    this.http.get("https://rawgit.com/HIQUALITYSTARTUPAFLIT/safe-7/master/README.md").subscribe(data => {
      let r = "<ion-list>";

      let one = (body) => {
        let t = marked(body);
        t = t.replace(/<h[1-6]/g, (x) => {
          return x + " ion-text";
        })
        .replace(/<img/g, "<ion-img").replace(/<\/img>/g, "</ion-item>")
        .replace(/<ul/g, "<ul class=\"list\"").replace(/<\/ul>/g, "</ion-list>")
        .replace(/<li/g, "<li class=\"item\"").replace(/<\/li>/g, "</ion-item>");

        return t;
      };

      var t = data._body.split("\n\n");
      for (var i = 0; i < t.length; i++){
        r += "<ion-item>" + one(t[i]) + "</ion-item>";
      }

      r += "</ion-list>"
      this.output.getNativeElement().innerHTML = r;
    });
  }

}
