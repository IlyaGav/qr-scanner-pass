import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeActivateSheetComponent } from './qr-code-activate-sheet/qr-code-activate-sheet.component';
import {QrCodeActivateSheetModule} from "./qr-code-activate-sheet/qr-code-activate-sheet.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";



@NgModule({
  declarations: [
    QrCodeActivateSheetComponent
  ],
  imports: [
    CommonModule,
    QrCodeActivateSheetModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ]
})
export class SharedModule { }
