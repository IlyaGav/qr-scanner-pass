import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Ticket} from "../../../../../api/models/ticket";
import {EditTicketDialogComponent} from "../edit-ticket-dialog/edit-ticket-dialog.component";
import {IsMobileService} from "../../../../shared/services/is-mobile.service";
import {TicketState} from "../../../../../api/models";

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketListComponent implements OnInit {

  @Input() dataSource: Ticket[] = [];

  @Input() displayColumns: string[] = [];

  @Output() refresh = new EventEmitter();

  states = TicketState;

  get isMobile() {
    return IsMobileService.isMobile;
  }

  constructor(private dialog: MatDialog,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  click(ticket: Ticket) {
    this.dialog.open(EditTicketDialogComponent, {
      data: ticket
    }).afterClosed()
      .subscribe(result => result && this.refresh.emit());
  }
}
