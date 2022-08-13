import {FormControl} from "@angular/forms";
import {TicketState} from "../../../../../api/models/ticket-state";

export interface EditTicketDialogForm {
  code: FormControl<string | null | undefined>;
  name: FormControl<string | null | undefined>;
  state: FormControl<TicketState | null | undefined>;
}
