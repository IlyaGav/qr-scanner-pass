/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { QrCode } from '../models/qr-code';

@Injectable({
  providedIn: 'root',
})
export class QrCodeApiService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation apiQrCodeActivateCodeGet
   */
  static readonly ApiQrCodeActivateCodeGetPath = '/api/QrCode/activate/{code}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `activate()` instead.
   *
   * This method doesn't expect any request body.
   */
  activate$Response(params: {
    code: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, QrCodeApiService.ApiQrCodeActivateCodeGetPath, 'get');
    if (params) {
      rb.path('code', params.code, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `activate$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  activate(params: {
    code: string;
  }): Observable<void> {

    return this.activate$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation apiQrCodeCodeGet
   */
  static readonly ApiQrCodeCodeGetPath = '/api/QrCode/{code}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get$Plain()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Plain$Response(params: {
    code: string;
  }): Observable<StrictHttpResponse<QrCode>> {

    const rb = new RequestBuilder(this.rootUrl, QrCodeApiService.ApiQrCodeCodeGetPath, 'get');
    if (params) {
      rb.path('code', params.code, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<QrCode>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get$Plain$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Plain(params: {
    code: string;
  }): Observable<QrCode> {

    return this.get$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<QrCode>) => r.body as QrCode)
    );
  }

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Response(params: {
    code: string;
  }): Observable<StrictHttpResponse<QrCode>> {

    const rb = new RequestBuilder(this.rootUrl, QrCodeApiService.ApiQrCodeCodeGetPath, 'get');
    if (params) {
      rb.path('code', params.code, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'text/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<QrCode>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `get$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  get(params: {
    code: string;
  }): Observable<QrCode> {

    return this.get$Response(params).pipe(
      map((r: StrictHttpResponse<QrCode>) => r.body as QrCode)
    );
  }

}
