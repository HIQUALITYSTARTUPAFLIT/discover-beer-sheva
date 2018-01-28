import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP } from '@ionic-native/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { AlertPage } from '../pages/alert/alert';
import { SettingsPage } from '../pages/settings/settings';
import { ContactUsPage } from '../pages/contact-us/contact-us';
import { CreatePasscodePage } from '../pages/create-passcode/create-passcode';

import { IonicStorageModule } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpModule } from '@angular/http';
import { AppPreferences } from '@ionic-native/app-preferences';


import { Vibration } from '@ionic-native/vibration';
import { SMS } from '@ionic-native/sms';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AlertPage,
    AboutPage,
    SettingsPage,
    ContactUsPage,
    CreatePasscodePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AlertPage,
    AboutPage,
    SettingsPage,
    ContactUsPage,
    CreatePasscodePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    HTTP,
    Vibration,
    SMS,
    AppPreferences,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule { }
