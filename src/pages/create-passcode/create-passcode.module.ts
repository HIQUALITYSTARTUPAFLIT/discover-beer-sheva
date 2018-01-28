import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatePasscodePage } from './create-passcode';

@NgModule({
  declarations: [
    CreatePasscodePage,
  ],
  imports: [
    IonicPageModule.forChild(CreatePasscodePage),
  ],
})
export class CreatePasscodePageModule {}
