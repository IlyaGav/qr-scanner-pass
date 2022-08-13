import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {QrCodeSettingService} from "./services/qr-code-setting.service";

@Component({
  templateUrl: './qr-code-setting-dialog.component.html',
  styleUrls: ['./qr-code-setting-dialog.component.scss']
})
export class QrCodeSettingDialogComponent implements OnInit {

  form: FormGroup<QrCodeSettingForm> = undefined!;

  constructor(fb: FormBuilder,
              private dialogRef: MatDialogRef<QrCodeSettingDialogComponent>,
              private qrCodeSettingService: QrCodeSettingService) {
    this.form = fb.group<QrCodeSettingForm>({
      width: fb.control<number | null | undefined>(qrCodeSettingService.setting.width),
      height: fb.control<number | null | undefined>(qrCodeSettingService.setting.height),
      frameRate: fb.control<number | null | undefined>(qrCodeSettingService.setting.frameRate),
      useRearCamera: fb.control<boolean | null>(qrCodeSettingService.setting.useRearCamera),
    });
  }

  ngOnInit(): void {
  }

  save() {
    this.qrCodeSettingService.setting = this.form.value as QrCodeSetting;
    this.dialogRef.close();
  }
}

export class QrCodeSetting {
  width: number = 4096;
  height: number = 2160;
  frameRate: number = 60;
  useRearCamera: boolean = true;
}

export interface QrCodeSettingForm {
  width: FormControl<number | null | undefined>;
  height: FormControl<number | null | undefined>;
  frameRate: FormControl<number | null | undefined>;
  useRearCamera: FormControl<boolean | null>;
}
