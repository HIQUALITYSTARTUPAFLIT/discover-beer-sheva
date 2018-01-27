import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration';
import { SMS } from '@ionic-native/sms';
import { HomePage } from '../home/home';
import { AppPreferences } from '@ionic-native/app-preferences';

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

  keypadInput : string;
  alertCountDown : number;
  alertCountTimeout : any;

  settings : any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private vibration: Vibration,
    private sms: SMS,
    private appPreferences: AppPreferences
  ) {
    this.settings ={};
    let ps = [];
    let loadOne = (name, spot) => {
      ps.push(this.appPreferences.fetch(name).then(d => { this.settings[spot] = d; }));
    }

    loadOne("Passcode", "pass");
    loadOne("Keypad Timeout", "timeout");
    loadOne("Emergency Contact Number", "phone");
    loadOne("Custom message", "message");
    loadOne("Send location", "sendLocation");

    Promise.all(ps).catch(d => { console.error(d); });

    this.keypadInput = "";
    this.alertCountDown = 5;

    this.alertCountTimeout = setInterval(() => {
      if (--this.alertCountDown >= 1){
        this.onTimeIn();
      }
      else{
        clearInterval(this.alertCountTimeout);
        this.onTimeOut();
      }
    }, 1000);
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

  sendKey(n): void{
    //this.keyPadStatus.innerText += "●";
    this.keypadInput += "" + n;
    console.log(typeof(n), this.keypadInput);
  }

  onTimeIn(){
    this.vibration.vibrate(500);
  }

  onTimeOut(){
    this.sms.send("+9720502382375", 'Hello World!')
    .then(d => { console.log(d); })
    .catch(e => { console.error(e); });
    this.navCtrl.push(HomePage);
  }
}
