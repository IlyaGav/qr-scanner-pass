import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {EditUserDialogForm} from "./edit-user-dialog.form";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {User} from "../../../../../api/models/user";
import {UserApiService} from "../../../../../api/services/user-api.service";

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {

  form: FormGroup<EditUserDialogForm> = undefined!;

  constructor(fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) user: User | undefined,
              private userApiService: UserApiService,
              private dialogRef: MatDialogRef<EditUserDialogComponent>) {
    this.form = fb.group<EditUserDialogForm>({
      id: fb.control<number | null | undefined>(user?.id),
      fullName: fb.control<string | null | undefined>(user?.fullName),
      qrCode: fb.control<string | null | undefined>(user?.qrCode),
      activated: fb.control<boolean | null | undefined>(user?.activated),
    })
  }

  ngOnInit(): void {
  }

  save() {
    const user: User = {
      id: this.form.value.id ?? undefined,
      fullName: this.form.value.fullName,
      qrCode: this.form.value.qrCode,
    };

    const method = this.form.controls.id.value
      ? this.userApiService.update({id: user.id!, body: user})
      : this.userApiService.create({body: user});

    method.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    })
  }

  cancel() {
    this.dialogRef.close(false);
  }

  delete() {
    this.userApiService.delete({id: this.form.value.id!}).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false)
    });
  }
}
