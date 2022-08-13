import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsComponent } from './tickets.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatCardModule} from "@angular/material/card";
import {MatPaginatorModule} from "@angular/material/paginator";
import {TicketListComponent} from "./components/ticket-list/ticket-list.component";
import {MatTableModule} from "@angular/material/table";
import {FiltersComponent} from "./components/filters/filters.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDateRangeModule} from "../../shared/mat-date-range/mat-date-range.module";
import {MatIconModule} from "@angular/material/icon";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSelectModule} from "@angular/material/select";
import {SharedModule} from "../../shared/shared.module";
import { EditTicketDialogComponent } from './components/edit-ticket-dialog/edit-ticket-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatBadgeModule} from "@angular/material/badge";
import {NgBusyModule} from "ng-busy";



@NgModule({
  declarations: [
    TicketsComponent,
    TicketListComponent,
    FiltersComponent,
    EditTicketDialogComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDateRangeModule,
    MatIconModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatSelectModule,
    SharedModule,
    MatDialogModule,
    MatButtonModule,
    MatBadgeModule,
    NgBusyModule
  ]
})
export class TicketsModule { }
