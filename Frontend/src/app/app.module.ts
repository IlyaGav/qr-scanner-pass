import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import '@angular/common/locales/global/ru';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {QrCodeActivateModule} from "./modules/pages/qr-code-activate/qr-code-activate.module";
import {SharedModule} from "./modules/shared/shared.module";
import {TicketsModule} from "./modules/pages/tickets/tickets.module";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {APP_DATE_FORMATS, getRusPaginatorIntl} from "./app.settings";
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from "@angular/material-moment-adapter";
import {MatPaginatorIntl} from "@angular/material/paginator";
import {NgBusyModule} from "ng-busy";
import {KeycloakAngularModule, KeycloakEventType, KeycloakService} from "keycloak-angular";
import {initializeKeycloak} from "./modules/auth/auth.config";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    KeycloakAngularModule,
    MatProgressSpinnerModule,
    QrCodeActivateModule,
    TicketsModule,
    SharedModule,
    NgBusyModule.forRoot({
      message: 'Пожалуйста, подождите!',
      disableAnimation: true
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: LOCALE_ID,
      useValue: 'ru-Ru'
    },
    {
      provide:
      MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: {useUtc: true}
    },
    {
      provide: DateAdapter, useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'outline'}
    },
    {
      provide: MatPaginatorIntl,
      useValue: getRusPaginatorIntl()
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(keycloak: KeycloakService) {
    keycloak.keycloakEvents$.subscribe({
      next: (e) => {
        if (e.type == KeycloakEventType.OnTokenExpired) {
          keycloak.updateToken(20).then();
        }
      }
    });
  }
}
