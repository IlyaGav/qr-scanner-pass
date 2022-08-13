import { Pipe, PipeTransform } from '@angular/core';
import {TicketState} from "../../../api/models/ticket-state";

@Pipe({
  name: 'ticketState'
})
export class TicketStatePipe implements PipeTransform {

  map: { [name in TicketState]: string } = {
    [TicketState.Activated]: 'Активирован',
    [TicketState.Inactivated]: 'Неактивирован'
  }

  transform(value: TicketState | undefined) {
    if (!value) {
      return '';
    }
    return this.map[value];
  }

}
