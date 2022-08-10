import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QrCodeActivateRoutingModule } from './qr-code-activate-routing.module';
import { QrCodeActivateComponent } from './qr-code-activate.component';
import {NgxScannerQrcodeModule} from "ngx-scanner-qrcode";
import {ZXingScannerModule} from "@zxing/ngx-scanner";
import {QuarModule} from "@altack/quar";
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  declarations: [
    QrCodeActivateComponent
  ],
  imports: [
    CommonModule,
    QrCodeActivateRoutingModule,
    NgxScannerQrcodeModule,
    ZXingScannerModule,
    QuarModule,
    MatBottomSheetModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class QrCodeActivateModule { }
