import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
      "title": "Test",
      "type": "text"
    }
  ];

  result : any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.result = {};
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  save(){
    console.log(this.result);
  }
}
