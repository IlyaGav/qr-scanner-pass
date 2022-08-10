import {ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {QrCodeApiService} from "../../../api/services/qr-code-api.service";
import {BehaviorSubject, tap} from "rxjs";
import {QrCodeInfo, State} from "../../pages/qr-code-activate/qr-code-activate.component";

@Component({
  selector: 'app-qr-code-activate-sheet',
  templateUrl: './qr-code-activate-sheet.component.html',
  styleUrls: ['./qr-code-activate-sheet.component.scss']
})
export class QrCodeActivateSheetComponent implements OnInit {

  @Output() success = new EventEmitter<boolean>();

  states = State;

  qrCodeInfo: QrCodeInfo | undefined;

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _bottomSheetRef: MatBottomSheetRef<QrCodeActivateSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) private code: string,
              private qrCodeApiService: QrCodeApiService,
              private cdr: ChangeDetectorRef) {
    this.loading$.next(true);

    this.qrCodeApiService.get({code: code})
      .subscribe({
      next: qr => {
        this.qrCodeInfo = {
          qrCode: qr.code ?? code,
          userName: qr.fullName ?? '',
          state: qr.activated ? State.Activated : State.NotActivated
        };

        this.success.next(!qr.activated ?? false)
        this.loading$.next(false);
        this.cdr.markForCheck();
      },
      error: err => {
        console.log('err', err);

        this.qrCodeInfo = {
          qrCode: code,
          userName: undefined,
          state: State.NotFound
        };

        this.success.next(false)
        this.loading$.next(false);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {

  }

  active() {
    if (!this.qrCodeInfo) {
      return;
    }

    this.loading$.next(true)

    this.qrCodeApiService.activate({code: this.qrCodeInfo.qrCode!})
      .subscribe({
        next: () => {
          console.log('activate success');

          this.loading$.next(false);
          this.qrCodeInfo!.state = State.Activated;
          this.cdr.markForCheck();

          this._bottomSheetRef.dismiss();
        },
        error: () => {
          this.loading$.next(false);
          console.log('activate error')
        }
      });
  }
}
