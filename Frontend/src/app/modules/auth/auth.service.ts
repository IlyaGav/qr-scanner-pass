// import { Injectable } from '@angular/core';
// import { OAuthService } from 'angular-oauth2-oidc';
// import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
// import { Observable } from 'rxjs';
// import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
//
// import { authConfig } from './auth.config';
// import { normalizeToLogin } from "../shared/constants";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//
//   initialize$ = new Observable<boolean>(sub => {
//     this.oauthService.loadDiscoveryDocumentAndLogin()
//       .then(res => {
//         sub.next(res);
//         sub.complete();
//       })
//   }).pipe(
//     tap(() =>
//       setTimeout(() =>
//         window.history.replaceState(null, '', window.location.href.split('#')[0]))),
//     shareReplay(),
//   );
//
//   userProfile$: Observable<any> = this.initialize$
//     .pipe(
//       switchMap(_ => this.oauthService.loadUserProfile()),
//       shareReplay()
//     );
//
//   accountId$: Observable<string> = this.userProfile$
//     .pipe(map(({ info }) => normalizeToLogin(info.name)!));
//
//   constructor(private oauthService: OAuthService) {
//     oauthService.configure(authConfig);
//     oauthService.tokenValidationHandler = new JwksValidationHandler();
//     oauthService.setupAutomaticSilentRefresh();
//   }
// }
