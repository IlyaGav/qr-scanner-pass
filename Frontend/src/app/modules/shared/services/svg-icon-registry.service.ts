import {Injectable} from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class SvgIconRegistryService {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
  }

  registryIcons() {
    this.matIconRegistry.addSvgIcon(
      'lock',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/lock.svg")
    );

    this.matIconRegistry.addSvgIcon(
      'padlock',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/padlock.svg")
    );
  }
}
