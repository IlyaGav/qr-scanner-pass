import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrCodeActivateSheetComponent} from './qr-code-activate-sheet/qr-code-activate-sheet.component';
import {QrCodeActivateSheetModule} from "./qr-code-activate-sheet/qr-code-activate-sheet.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";
import {QrCodeSettingDialogModule} from "./qr-code-setting-dialog/qr-code-setting-dialog.module";
import {TicketStatePipe} from "./pipes/ticket-state.pipe";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {NgBusyModule} from "ng-busy";
import {MatDateRangeModule} from "./mat-date-range/mat-date-range.module";
import {MatDatepickerModule} from "@angular/material/datepicker";


@NgModule({
  declarations: [
    QrCodeActivateSheetComponent,
    TicketStatePipe
  ],
  exports: [
    TicketStatePipe
  ],
  imports: [
    CommonModule,
    QrCodeActivateSheetModule,
    QrCodeSettingDialogModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    NgBusyModule,
    MatDateRangeModule,
    MatDatepickerModule,
  ]
})
export class SharedModule {
}
