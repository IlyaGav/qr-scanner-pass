import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeSettingDialogComponent } from './qr-code-setting-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";



@NgModule({
  declarations: [
    QrCodeSettingDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ]
})
export class QrCodeSettingDialogModule { }
