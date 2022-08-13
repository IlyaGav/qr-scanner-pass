import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {TicketState} from "../../../../../api/models/ticket-state";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'ticket-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent implements OnInit {

  @Input() form!: FormGroup<FindTicketRequestForm>

  states: TicketState[] = Object.values(TicketState) as TicketState[];

  constructor() {
  }

  ngOnInit(): void {
  }

}

export interface FindTicketRequestForm {
  code: FormControl<string | null | undefined>;
  name: FormControl<string | null | undefined>;
  state: FormControl<TicketState | null | undefined>;
  from: FormControl<string | null | undefined>;
  to: FormControl<string | null | undefined>;
}
