import {ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {TicketApiService} from "../../../api/services/ticket-api.service";
import {Ticket} from "../../../api/models/ticket";
import {TicketState} from "../../../api/models";
import {PassApiService} from "../../../api/services/pass-api.service";

@Component({
  selector: 'app-qr-code-activate-sheet',
  templateUrl: './qr-code-activate-sheet.component.html',
  styleUrls: ['./qr-code-activate-sheet.component.scss']
})
export class QrCodeActivateSheetComponent implements OnInit {

  @Output() success = new EventEmitter<boolean>();

  states = TicketState;

  ticket: Ticket | undefined;

  busy: any;

  constructor(private _bottomSheetRef: MatBottomSheetRef<QrCodeActivateSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) private code: string,
              private ticketApiService: TicketApiService,
              private passApiService: PassApiService,
              private cdr: ChangeDetectorRef) {

    this.busy = this.ticketApiService.get({code: code})
      .subscribe({
        next: ticket => {
          this.ticket = ticket;

          this.success.next(ticket.state === TicketState.Inactivated)
          this.cdr.markForCheck();
        },
        error: err => {
          console.log('err', err);

          this.ticket = {
            code: code,
            name: undefined,
            // state: State.NotFound
          };

          this.success.next(false)
          this.cdr.markForCheck();
        }
      });
  }

  ngOnInit(): void {

  }

  active() {
    if (!this.ticket) {
      return;
    }

    this.busy = this.passApiService.activate({code: this.ticket?.code!})
      .subscribe({
        next: () => {
          console.log('activate success');

          this.cdr.markForCheck();

          this._bottomSheetRef.dismiss();
        },
        error: () => {
          console.log('activate error')
        }
      });
  }
}
