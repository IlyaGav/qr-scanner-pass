/* tslint:disable */
/* eslint-disable */
import { TicketState } from './ticket-state';
export interface Ticket {
  code?: null | string;
  createDate?: string;
  name?: null | string;
  state?: TicketState;
}
