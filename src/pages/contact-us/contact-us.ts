import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';

/**
 * Generated class for the ContactUsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contact-us',
  templateUrl: 'contact-us.html',
})
export class ContactUsPage {
  @ViewChild('commentField') commentField: ElementRef;
  @ViewChild('commentLabel') commentLabel: ElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactUsPage');
  }

  submit(){

    let m = this.commentField.nativeElement.value;
    let data = {
      "Name": "Debug app",
      "Email": "dan@bigidea.co.il",
      "Message": m
    };
    this.http.post("http://startups.cdi-negev.com/send-email.php", data).subscribe(d => console.log(d));
  }

}
