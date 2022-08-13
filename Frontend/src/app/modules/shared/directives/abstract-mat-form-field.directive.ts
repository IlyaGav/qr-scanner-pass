import {ErrorStateMatcher, mixinErrorState} from "@angular/material/core";
import {Directive, DoCheck, ElementRef, HostBinding, HostListener, Input, OnDestroy} from "@angular/core";
import {ControlValueAccessor, FormGroupDirective, NgControl, NgForm, Validators} from "@angular/forms";
import {MatFormFieldControl} from "@angular/material/form-field";
import {FocusMonitor} from "@angular/cdk/a11y";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {Subject} from "rxjs";

class _AbstractMatFormField {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl,
    public stateChanges: Subject<void>
  ) {
  }
}

@Directive()
export abstract class AbstractMatFormFieldDirective<T> extends mixinErrorState(_AbstractMatFormField)
  implements DoCheck, OnDestroy, ControlValueAccessor, MatFormFieldControl<T> {
  protected onChange?: (value: T) => void;
  protected onTouched?: () => void;

  private static nextId: number = 0;

  public set value(value: T) {
    this._value = value;

    if (this.onChange) {
      this.onChange(value);
    }
  }

  public get value(): T {
    return this._value;
  }

  public get empty(): boolean {
    return !this.value;
  }

  @Input()
  public set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  public get placeholder() {
    return this._placeholder;
  }

  @Input()
  public set required(required: any) {
    this._required = coerceBooleanProperty(required);
    this.stateChanges.next();
  }

  public get required() {
    return this.ngControl
      ? this.ngControl.control?.hasValidator(Validators.required)
      : this._required;
  }

  @Input()
  public set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled);
    if (this.focused) {
      this.focused = false;
    }
    this.stateChanges.next();
  }

  public get disabled() {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  @HostListener("focusout")
  onBlur() {
    this.focused = false;
    if (this.onTouched) {
      this.onTouched();
    }
    this.stateChanges.next();
  }

  @HostBinding('class.floating')
  public get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  @HostBinding()
  public id: string = `${this.controlType}-${AbstractMatFormFieldDirective.nextId++}`;

  @HostBinding('attr.aria-describedBy')
  public describedBy: string = '';

  public focused = false;

  public abstract focus(): void;

  private _value!: T;

  private _placeholder: string = "";

  private _required: boolean = false;

  private _disabled: boolean = false;

  protected constructor(
    public readonly controlType: string,
    // ErrorStateMixin
    public override readonly ngControl: NgControl,
    public override readonly _parentForm: NgForm,
    public override readonly _parentFormGroup: FormGroupDirective,
    public override readonly _defaultErrorStateMatcher: ErrorStateMatcher,
    // FocusMonitor
    protected readonly _focusMonitor: FocusMonitor,
    protected readonly _elementRef: ElementRef
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl, new Subject());

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    if (_focusMonitor) {
      _focusMonitor
        .monitor(this._elementRef.nativeElement, true)
        .subscribe(origin => {
          this.focused = !!origin;
          this.stateChanges.next();
        });
    }
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  public registerOnChange(fn: (_: T) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: T): void {
    this._value = value;
  }

  public setDisabledState(state: boolean) {
    this.disabled = state;
  }

  public setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(" ");
  }

  public onContainerClick(): void {
    if (!this.focused) {
      this.focus();
    }
  }
}
