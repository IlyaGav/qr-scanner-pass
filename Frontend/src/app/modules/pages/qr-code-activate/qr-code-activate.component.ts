import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgxScannerQrcodeComponent} from 'ngx-scanner-qrcode';
import {BehaviorSubject, delay, distinctUntilChanged, first, of, timeout} from "rxjs";
import {filter} from "rxjs/operators";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {QrCodeActivateSheetComponent} from "../../shared/qr-code-activate-sheet/qr-code-activate-sheet.component";
import {ZXingScannerComponent} from "@zxing/ngx-scanner";

export enum State {
  NotFound = 'NotFound',
  NotActivated = 'NotActivated',
  Activated = 'Activated'
}

export class QrCodeInfo {
  qrCode: string = undefined!;

  state: State = undefined!;

  userName: string | undefined;
}

@Component({
  selector: 'app-qr-code-activate',
  templateUrl: './qr-code-activate.component.html',
  styleUrls: ['./qr-code-activate.component.scss']
})
export class QrCodeActivateComponent implements OnInit, AfterViewInit {

  // @ViewChild('scanner') scanner: NgxScannerQrcodeComponent = undefined!;
  @ViewChild('scanner') scanner: ZXingScannerComponent = undefined!;

  qr$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  success$: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  private cameras: MediaDeviceInfo[] = [];

  constructor(public _bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {

    this.qr$
      .pipe(
        filter(qr => !!qr),
        distinctUntilChanged((x, y) => x === y && !!this._bottomSheet._openedBottomSheetRef)
      )
      .subscribe({
        next: qr => {
          const bottomSheet = this._bottomSheet._openedBottomSheetRef;

          (bottomSheet?.afterDismissed() ?? of(null))
            .subscribe(() => {
              const newBottomSheet = this._bottomSheet.open(QrCodeActivateSheetComponent, {data: qr});

              newBottomSheet.instance.success
                .pipe(first())
                .subscribe(value => {
                  this.success$.next(value);
                });

              newBottomSheet.afterDismissed()
                .subscribe(() => {
                  this.success$.next(undefined);
                });
            });

          bottomSheet?.dismiss();
        }
      });
  }

  onSuccess(qr: string) {
    console.log('qr', qr)
    this.qr$.next(qr);
  }

  onError($event: any) {
    console.log($event);
  }

  toggleCamera() {
    if (this.scanner.hasDevices) {
      const indexOf = this.cameras.indexOf(this.scanner.device!) + 1;

      if (indexOf >= this.cameras.length) {
        this.scanner.device = this.cameras[0];
        return;
      }

      this.scanner.device = this.cameras[indexOf];
    }
  }

  toggleTorch() {
    this.scanner.torch = !this.scanner.torch;
  }

  ngAfterViewInit(): void {
    // TODO FOR TEST
    // this.scanner?.toggleCamera();
  }

  camerasFound($event: MediaDeviceInfo[]) {
    this.cameras = $event ?? [];
  }
}
