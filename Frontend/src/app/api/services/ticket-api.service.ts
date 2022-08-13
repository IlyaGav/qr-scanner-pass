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

import { FindTicketRequest } from '../models/find-ticket-request';
import { FindTicketResponse } from '../models/find-ticket-response';
import { Ticket } from '../models/ticket';

@Injectable({
  providedIn: 'root',
})
export class TicketApiService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation apiTicketFindPost
   */
  static readonly ApiTicketFindPostPath = '/api/Ticket/find';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `find$Plain()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  find$Plain$Response(params?: {
    body?: FindTicketRequest
  }): Observable<StrictHttpResponse<FindTicketResponse>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketFindPostPath, 'post');
    if (params) {
      rb.body(params.body, 'application/*+json');
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<FindTicketResponse>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `find$Plain$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  find$Plain(params?: {
    body?: FindTicketRequest
  }): Observable<FindTicketResponse> {

    return this.find$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<FindTicketResponse>) => r.body as FindTicketResponse)
    );
  }

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `find()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  find$Response(params?: {
    body?: FindTicketRequest
  }): Observable<StrictHttpResponse<FindTicketResponse>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketFindPostPath, 'post');
    if (params) {
      rb.body(params.body, 'application/*+json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'text/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<FindTicketResponse>;
      })
    );
  }

  /**
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `find$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  find(params?: {
    body?: FindTicketRequest
  }): Observable<FindTicketResponse> {

    return this.find$Response(params).pipe(
      map((r: StrictHttpResponse<FindTicketResponse>) => r.body as FindTicketResponse)
    );
  }

  /**
   * Path part for operation apiTicketCodeGet
   */
  static readonly ApiTicketCodeGetPath = '/api/Ticket/{code}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `get$Plain()` instead.
   *
   * This method doesn't expect any request body.
   */
  get$Plain$Response(params: {
    code: string;
  }): Observable<StrictHttpResponse<Ticket>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketCodeGetPath, 'get');
    if (params) {
      rb.path('code', params.code, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: 'text/plain'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Ticket>;
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
  }): Observable<Ticket> {

    return this.get$Plain$Response(params).pipe(
      map((r: StrictHttpResponse<Ticket>) => r.body as Ticket)
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
  }): Observable<StrictHttpResponse<Ticket>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketCodeGetPath, 'get');
    if (params) {
      rb.path('code', params.code, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'text/json'
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Ticket>;
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
  }): Observable<Ticket> {

    return this.get$Response(params).pipe(
      map((r: StrictHttpResponse<Ticket>) => r.body as Ticket)
    );
  }

  /**
   * Path part for operation apiTicketCodePut
   */
  static readonly ApiTicketCodePutPath = '/api/Ticket/{code}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `update()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  update$Response(params: {
    code: string;
    body?: Ticket
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketCodePutPath, 'put');
    if (params) {
      rb.path('code', params.code, {});
      rb.body(params.body, 'application/*+json');
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
   * To access the full response (for headers, for example), `update$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  update(params: {
    code: string;
    body?: Ticket
  }): Observable<void> {

    return this.update$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation apiTicketCodeDelete
   */
  static readonly ApiTicketCodeDeletePath = '/api/Ticket/{code}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete$Response(params: {
    code: string;
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketCodeDeletePath, 'delete');
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
   * To access the full response (for headers, for example), `delete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete(params: {
    code: string;
  }): Observable<void> {

    return this.delete$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation apiTicketPost
   */
  static readonly ApiTicketPostPath = '/api/Ticket';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `create()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  create$Response(params?: {
    body?: Ticket
  }): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, TicketApiService.ApiTicketPostPath, 'post');
    if (params) {
      rb.body(params.body, 'application/*+json');
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
   * To access the full response (for headers, for example), `create$Response()` instead.
   *
   * This method sends `application/*+json` and handles request body of type `application/*+json`.
   */
  create(params?: {
    body?: Ticket
  }): Observable<void> {

    return this.create$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
