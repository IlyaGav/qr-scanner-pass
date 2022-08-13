/* tslint:disable */
/* eslint-disable */
import { TicketState } from './ticket-state';
export interface FindTicketRequest {
  code?: null | string;
  limit?: null | number;
  name?: null | string;
  offset?: null | number;
  state?: TicketState;
}
