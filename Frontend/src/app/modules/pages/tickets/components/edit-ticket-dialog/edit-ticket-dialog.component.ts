import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Ticket} from "../../../../../api/models/ticket";
import {TicketApiService} from "../../../../../api/services/ticket-api.service";
import {EditTicketDialogForm} from "./edit-ticket-dialog.form";
import {TicketState} from "../../../../../api/models/ticket-state";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-edit-ticket-dialog',
  templateUrl: './edit-ticket-dialog.component.html',
  styleUrls: ['./edit-ticket-dialog.component.scss']
})
export class EditTicketDialogComponent implements OnInit {

  form: FormGroup<EditTicketDialogForm> = undefined!;
  states: TicketState[] = Object.values(TicketState) as TicketState[];

  busy: any;

  readonly new: boolean = false;

  constructor(fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) ticket: Ticket | undefined,
              private apiService: TicketApiService,
              private dialogRef: MatDialogRef<EditTicketDialogComponent>) {
    this.form = fb.group<EditTicketDialogForm>({
      code: fb.control<string | null | undefined>(ticket?.code),
      name: fb.control<string | null | undefined>(ticket?.name),
      state: fb.control<TicketState | null | undefined>(ticket?.state),
    });

    this.new = !ticket;
  }

  ngOnInit(): void {
  }

  save() {
    const ticket: Ticket = {
      code: this.form.value.code ?? undefined,
      name: this.form.value.name,
      state: this.form.value.state ?? undefined,
    };

    const method = !this.new
      ? this.apiService.update({code: ticket.code!, body: ticket})
      : this.apiService.create({body: ticket});

    this.busy = method.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    })
  }

  cancel() {
    this.dialogRef.close(false);
  }

  delete() {
    this.busy = this.apiService.delete({code: this.form.value.code!}).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    });
  }

}
