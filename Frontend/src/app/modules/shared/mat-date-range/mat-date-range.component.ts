import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild
} from '@angular/core';
import {FormControl, FormGroupDirective, NgControl, NgForm} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {MatDatepicker, MatDateRangePicker} from "@angular/material/datepicker";
import {FocusMonitor} from "@angular/cdk/a11y";
import {AbstractMatFormFieldDirective} from "../directives/abstract-mat-form-field.directive";
import {IsMobileService} from "../services/is-mobile.service";

@Component({
  selector: 'app-mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: MatDateRangeComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatDateRangeComponent extends AbstractMatFormFieldDirective<any> implements OnInit, AfterViewInit {

  @Input() from!: FormControl<any>;
  @Input() to!: FormControl<any>;

  @ViewChild('picker') rangePicker!: MatDateRangePicker<any>;
  @ViewChild('fromPicker') fromPicker!: MatDatepicker<any>;
  @ViewChild('toPicker') toPicker!: MatDatepicker<any>;

  get isMobile() {
    return IsMobileService.isMobile;
  }

  constructor(
    @Optional() @Self() ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    _focusMonitor: FocusMonitor,
    _elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    super(
      'ep-mat-date-range',
      ngControl,
      _parentForm,
      _parentFormGroup,
      _defaultErrorStateMatcher,
      _focusMonitor,
      _elementRef
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.rangePicker.openedStream
      .subscribe(() => this.cdr.markForCheck());
  }

  override get shouldLabelFloat(): boolean {
    return this.focused || this.from.value || this.to.value
      || this.rangePicker?.opened || this.fromPicker?.opened || this.toPicker?.opened;
  }

  focus(): void {
    this.rangePicker?.open();
  }
}
