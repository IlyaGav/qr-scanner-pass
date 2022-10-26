import {ToastrService} from "ngx-toastr";
import {Injectable} from "@angular/core";
import {IsMobileService} from "./is-mobile.service";

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  get positionClass() {
    return this.isMobileService.isMobile ? 'toast-top-full-width' : 'toast-top-right';
  }

  constructor(private toastr: ToastrService, private isMobileService: IsMobileService) {
  }

  public error(message: string, title?: string | undefined) {
    this.toastr.error(message, title, {
      timeOut: 3000,
      positionClass: this.positionClass,
    });
  }

  public success(message: string, title?: string | undefined) {
    this.toastr.success(message, title, {
      positionClass: this.positionClass,
    });
  }

  public info(message: string, title?: string | undefined) {
    this.toastr.info(message, title, {
      timeOut: 5000,
      positionClass: this.positionClass,
    });
  }

  public warning(message: string, title?: string | undefined) {
    this.toastr.warning(message, title, {
      positionClass: this.positionClass,
    });
  }

  public showTamplate(tamplate: string, title?: string | undefined) {
    this.toastr.info(tamplate, title, {
      enableHtml: true,
      disableTimeOut: true,
      closeButton: true
    });
  }
}
