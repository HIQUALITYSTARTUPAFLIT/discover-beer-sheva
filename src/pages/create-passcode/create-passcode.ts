import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  keypadInput: string;
  firstPasscode: string;
  secondPasscode : string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.keypadInput = "";
    this.firstPasscode = "";
    this.secondPasscode = "";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatePasscodePage');
<<<<<<< HEAD
  }

  goHome() {
    this.navCtrl.push(HomePage);
=======
>>>>>>> parent of e4c7b8b... go home feature
  }
  logKey(n) {
    if (this.firstPasscode == "") {
      this.keypadInput += "" + n;

      if (this.keypadInput.length == 4) {
        console.log("Passcode Completed");
        this.firstPasscode = this.keypadInput;
        this.keypadInput = "";
      }
    } else {
      this.keypadInput += "" + n;
      
      if (this.keypadInput == 4){
        console.log(this.keypadInput)
        this.secondPasscode = this.keypadInput;
        this.keypadInput = "";

        if(this.firstPasscode == this.secondPasscode){
          console.log("Passcodes match")
        } else {
          console.log("Passcodes do not match")
        }
      }
    }



  }
}
