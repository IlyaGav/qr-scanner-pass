import {FormControl} from "@angular/forms";

export interface EditUserDialogForm {
  id: FormControl<number | null | undefined>;
  fullName: FormControl<string | null | undefined>;
  qrCode: FormControl<string | null | undefined>;
  activated : FormControl<boolean | null | undefined>;
}
