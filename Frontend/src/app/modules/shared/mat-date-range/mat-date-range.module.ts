import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDateRangeComponent} from "./mat-date-range.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [MatDateRangeComponent],
  exports: [
    MatDateRangeComponent
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    ReactiveFormsModule
  ]
})
export class MatDateRangeModule { }
