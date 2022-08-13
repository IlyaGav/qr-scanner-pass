import {Injectable} from '@angular/core';
import {QrCodeSetting} from "../qr-code-setting-dialog.component";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class QrCodeSettingService {

  set setting(setting: QrCodeSetting) {
    localStorage.setItem('qrCodeSetting', JSON.stringify(setting));
    this.setting$.next(setting);
  }

  get setting() {
    return this.setting$.value;
  }

  setting$: BehaviorSubject<QrCodeSetting>;

  constructor() {
    const settingJson = localStorage.getItem('qrCodeSetting');
    const setting = settingJson ? JSON.parse(settingJson) as QrCodeSetting : new QrCodeSetting();
    this.setting$ = new BehaviorSubject<QrCodeSetting>(setting);
  }
}
