import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatDateFormats } from "@angular/material/core";

const rusRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) { return `0 из ${length}`; }

  length = Math.max(length, 0);
  const startIndex = page * pageSize;
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} из ${length}`;
};

export function getRusPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Записей на странице:';
  paginatorIntl.nextPageLabel = 'Следующая';
  paginatorIntl.previousPageLabel = 'Предыдущая';
  paginatorIntl.lastPageLabel = 'Последняя';
  paginatorIntl.firstPageLabel = 'Первая';
  paginatorIntl.getRangeLabel = rusRangeLabel;

  return paginatorIntl;
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMMM Y',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM Y'
  }
};
