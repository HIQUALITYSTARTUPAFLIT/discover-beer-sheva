import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppPreferences } from '@ionic-native/app-preferences';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  template = [
    {
      "title": "Passcode",
      "type": "number",
      "def": "1234"
    },
    {
      "title": "Keypad Timeout",
      "type": "number",
      "def": "5"
    },
    {
      "title": "Emergency Contact Number",
      "type": "tel",
      "def": ""
    },
    {
      "title": "Custom message",
      "type": "text",
      "def": "Help me"
    },
    {
      "title": "Send location",
      "type": "bool",
      "def": true
    }
  ];

  result: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private appPreferences: AppPreferences) {
    this.result = {};

    let ps = [];
    let loadOne = (name) => {
      let t = this.appPreferences.fetch(name).then(d => {
        //this.template[spot].default = d;
        for (var i = 0; i < this.template.length; i++) {
          if (this.template[i].title == name) {
            this.template[i].def = d || this.template[i].def;
          }
        }
      });
      ps.push(t);
      return t;
    };

    loadOne("Passcode");
    loadOne("Keypad Timeout");
    loadOne("Emergency Contact Number");
    loadOne("Custom message");
    loadOne("Send location");

    Promise.all(ps).catch(e => console.log(e));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  useInputTag(t) {
    let r = ["text", "password", "email", "number", "search", "tel", "url"].indexOf(t) > -1;
    return r
  }

  useCheckBox(t) {
    let r = ["bool"].indexOf(t) > -1;
    return r;
  }

  save() {
    console.log(this.result);
    for (let key in this.result) {
      this.appPreferences.store(key, this.result[key])
        .then(d => console.log(d))
        .catch(e => console.error(e));
    }
  }
}
