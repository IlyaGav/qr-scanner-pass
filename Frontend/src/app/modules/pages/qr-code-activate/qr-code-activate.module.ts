import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {QrCodeActivateRoutingModule} from './qr-code-activate-routing.module';
import {QrCodeActivateComponent} from './qr-code-activate.component';
import {ZXingScannerModule} from "@zxing/ngx-scanner";
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
  declarations: [
    QrCodeActivateComponent
  ],
  imports: [
    CommonModule,
    QrCodeActivateRoutingModule,
    ZXingScannerModule,
    MatBottomSheetModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ]
})
export class QrCodeActivateModule {
}
