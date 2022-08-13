import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsMobileService {

  constructor() {
  }

  get isMobile() {
    return IsMobileService.isMobile;
  }

  static get isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
