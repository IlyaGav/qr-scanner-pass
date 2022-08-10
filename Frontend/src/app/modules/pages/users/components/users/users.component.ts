import {Component, OnInit} from '@angular/core';
import {Observable, shareReplay} from "rxjs";
import {User} from "../../../../../api/models/user";
import {UserApiService} from "../../../../../api/services/user-api.service";
import {MatDialog} from "@angular/material/dialog";
import {EditUserDialogComponent} from "../edit-user-dialog/edit-user-dialog.component";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayColumns = ['fullName', 'qrCode', 'activated'];
  dataSource$: Observable<User[]> = undefined!;

  constructor(private userApiService: UserApiService, private matDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataSource$ = this.userApiService.getAll().pipe(map(x => x ?? []), shareReplay(1));
  }

  editOrCreate(user?: User) {
    this.matDialog.open(EditUserDialogComponent, {data: user})
      .afterClosed()
      .subscribe({
        next: result => {
          if (result) {
            console.log('refresh');
            this.dataSource$ = this.userApiService.getAll().pipe(map(x => x ?? []), shareReplay(1));
          }
        }
      });
  }
}
