import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, catchError, distinctUntilChanged, first, from, of, switchMap, tap} from "rxjs";
import {filter} from "rxjs/operators";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {QrCodeActivateSheetComponent} from "../../shared/qr-code-activate-sheet/qr-code-activate-sheet.component";
import {ZXingScannerComponent} from "@zxing/ngx-scanner";
import {MatDialog} from "@angular/material/dialog";
import {QrCodeSettingDialogComponent} from "../../shared/qr-code-setting-dialog/qr-code-setting-dialog.component";
import {QrCodeSettingService} from "../../shared/qr-code-setting-dialog/services/qr-code-setting.service";

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

  @ViewChild('scanner') scanner: ZXingScannerComponent = undefined!;

  qr$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  success$: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);

  console: any = '';

  constructor(public _bottomSheet: MatBottomSheet,
              private dialog: MatDialog,
              private qrCodeSettingService: QrCodeSettingService,
              private cdr: ChangeDetectorRef) {
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

  ngAfterViewInit(): void {

    this.qrCodeSettingService.setting$
      .pipe(
        switchMap(setting => from(navigator.mediaDevices.enumerateDevices())
          .pipe(
            switchMap(devices =>
              from(navigator.mediaDevices.getUserMedia({
                  video: {
                    width: {
                      ideal: setting.width
                    },
                    height: {
                      ideal: setting.height
                    },
                    facingMode: {
                      ideal: setting.useRearCamera ? 'environment' : 'user'
                    },
                    frameRate: {
                      ideal: setting.frameRate
                    }
                  }
                })
              )
                .pipe(
                  tap(stream => {
                    const cap = stream.getVideoTracks()?.[0].getCapabilities();

                    this.console = {
                      height: cap.height?.max,
                      width: cap.width?.max,
                      frameRate: cap.frameRate?.max
                    }
                  }),
                  switchMap(stream => devices.filter(d => d.deviceId == stream.getVideoTracks()?.[0].getCapabilities().deviceId)),
                  catchError(err => {
                    this.console = 'error';
                    console.log('error');
                    this.console = err;
                    return of(undefined)
                  }),
                )
            )
          )
        )
      )
      .subscribe((device) => {
        console.log('device', device)
        this.scanner.device = device;
        this.cdr.markForCheck();
      });
  }

  onSuccess(qr: string) {
    console.log('qr', qr)
    this.qr$.next(qr);
  }

  onError($event: any) {
    console.log($event);
  }

  openSettings() {
    this.dialog.open(QrCodeSettingDialogComponent);
  }

  toggleTorch() {
    this.scanner.torch = !this.scanner.torch;
  }

  // camerasFound($event: MediaDeviceInfo[]) {
  //
  //   console.log('camerasFound', $event)
  //   // this.cameras = $event ?? [];
  // }

  // toggleCamera() {
  //   if (this.scanner.hasDevices) {
  //     const indexOf = this.cameras.indexOf(this.scanner.device!) + 1;
  //
  //     if (indexOf >= this.cameras.length) {
  //       this.scanner.device = this.cameras[0];
  //       return;
  //     }
  //
  //     this.scanner.device = this.cameras[indexOf];
  //   }
  // }
}
