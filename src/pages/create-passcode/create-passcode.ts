import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home'

/**
 * Generated class for the CreatePasscodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-passcode',
  templateUrl: 'create-passcode.html',
})

export class CreatePasscodePage {
  keypadInput : string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  this.keypadInput = "2";
  console.log(this.keypadInput);
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatePasscodePage');
  }

  goHome(){
    this.navCtrl.push(HomePage);
  }
  logKey(n){

  }
}
