import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
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
    private alertCtrl: AlertController
  ) {
    this.settings = {};
    let ps = [];
    let loadOne = (name, spot, def) => {
      let t = this.appPreferences.fetch(name).then(d => { this.settings[spot] = d || def; });
      ps.push(t);
      return t;
    }

    loadOne("Passcode", "pass", "1234");
    loadOne("Keypad Timeout", "timeout", "5");
    loadOne("Emergency Contact Number", "phone", "");
    loadOne("Custom message", "message", "Help me");
    loadOne("Send location", "sendLocation", true);

    Promise.all(ps).then(d => {
      this.alertCountDown = this.settings.timeout;
      this.alertCountTimeout = setInterval(() => {
        if (--this.alertCountDown >= 1) {
          this.onTimeIn();
        }
        else {
          clearInterval(this.alertCountTimeout);
          this.onTimeOut();
        }
      }, 1000);
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
    console.log(typeof (n), this.keypadInput);

    if (this.keypadInput == this.settings.pass) {
      clearInterval(this.alertCountTimeout);
      this.presentAlert("Alert", "Disarmed text");
      this.navCtrl.push(HomePage);
    }
  }

  onTimeIn() {
    this.vibration.vibrate(500);
  }

  onTimeOut() {
    this.sms.send(this.settings.phone, 'Hello World!')
      .then(d => { console.log(d); })
      .catch(e => { console.error(e); });
    this.presentAlert("Alert", "Emergency text sent to " + this.settings.phone);
    this.navCtrl.push(HomePage);
  }

  presentAlert(title, body) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: body,
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
