// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
//
// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//
//   constructor() {
//   }
//
//   public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!this.isApiRequest(req)) return next.handle(req);
//
//     const token = localStorage.getItem('access_token');
//
//     if (!!token) {
//       const header = 'Bearer ' + token;
//       const headers = req.headers.set('X-AUTH-TOKEN', header);
//       req = req.clone({ headers });
//     } else {
//       console.error('auth', 'access token not found');
//     }
//
//     return next.handle(req)
//       .pipe(catchError(err => this.errorHandler.handleError(err)));
//   }
//
//
//   private isApiRequest(req: HttpRequest<any>): boolean {
//     const url = req.url.toLowerCase();
//     return url.startsWith('api') || url.startsWith('/api')
//       || url.startsWith('https://tasks')
//       || (url.indexOf('actionLogger') >= 0);
//   }
// }
