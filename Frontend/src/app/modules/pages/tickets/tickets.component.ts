import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {TicketApiService} from "../../../api/services/ticket-api.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {FindTicketRequestForm} from "./components/filters/filters.component";
import {MatPaginator} from "@angular/material/paginator";
import {FindTicketRequest} from "../../../api/models/find-ticket-request";
import {Ticket} from "../../../api/models/ticket";
import {distinctUntilChanged} from "rxjs";
import {EditTicketDialogComponent} from "./components/edit-ticket-dialog/edit-ticket-dialog.component";
import {IsMobileService} from "../../shared/services/is-mobile.service";

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {

  get isActualFilters() {
    return this._isActualFilters;
  }

  get isMobile() {
    return IsMobileService.isMobile;
  }

  dataSource: Ticket[] = [];

  displayColumns: string[] = [];

  filtersGroup: FormGroup<FindTicketRequestForm>;

  filters: FindTicketRequest = {};

  totalCount: number = 0;

  busy: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly allColumns = [
    'name',
    'code',
    'state',
    'createDate'
  ];

  private _isActualFilters: boolean = true;

  constructor(private apiService: TicketApiService,
              private formBuilder: FormBuilder,
              private cdr: ChangeDetectorRef,
              private dialog: MatDialog,) {
    this.filtersGroup = formBuilder.group<FindTicketRequestForm>(
      {
        code: formBuilder.control(undefined),
        name: formBuilder.control(undefined),
        state: formBuilder.control(undefined),
        from: formBuilder.control(undefined),
        to: formBuilder.control(undefined)
      }
    );
  }

  ngOnInit(): void {
    this.filtersGroup.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => this._isActualFilters = JSON.stringify(this.filters) === JSON.stringify(value));
  }

  ngAfterViewInit(): void {
    this.paginator._formFieldAppearance = 'standard';
    this.search();
    this.cdr.detectChanges();
  }

  clearFilter() {
    this.filtersGroup.reset();
  }

  search() {
    this.filters = this.filtersGroup.value as FindTicketRequest;
    this._isActualFilters = true;
    this.paginator.pageIndex = 0;
    this.loadPage();
  }

  refresh() {
    this.loadPage();
  }

  @HostListener('window: keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.dialog.openDialogs.length > 0) return;

    if (this.isSearchKey(event)) {
      this.search();
    }
  }

  private loadPage() {
    const offset = this.paginator?.pageIndex * this.paginator?.pageSize;
    const limit = this.paginator?.pageSize;

    this.busy = this.apiService.find({body: {...this.filters, offset: offset, limit: limit}})
      .subscribe({
        next: res => {
          const mapColumn = (col: string, item: Ticket) => {
            switch (col) {
              default:
                return (<any>item)[col] != null
            }
          }

          this.displayColumns = this.allColumns
            .filter(col => res.results?.some(item => mapColumn(col, item)));

          this.dataSource = res.results ?? [];
          this.totalCount = res.totalCount ?? 0;
        },
        error: err => {
          this.dataSource = [];
          this.displayColumns = this.allColumns;
          // this.notifierService.showError('Ошибка получения данных');
        }
      });
  }

  create() {
    this.dialog.open(EditTicketDialogComponent, {
      width: this.isMobile ? '100%' : '',
      maxWidth: this.isMobile ? '90%' : '',
      minWidth: this.isMobile ? '' : '600px',
    }).afterClosed()
      .subscribe(result => result && this.refresh());
  }

  private isSearchKey(event: KeyboardEvent) {
    return event.code === 'Enter' || event.code === 'NumpadEnter';
  }
}
