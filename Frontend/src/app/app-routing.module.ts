import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {QrCodeActivateComponent} from "./modules/pages/qr-code-activate/qr-code-activate.component";
import {UsersComponent} from "./modules/pages/users/components/users/users.component";

const routes: Routes = [
  {
    path: '',
    component: QrCodeActivateComponent,
    // loadChildren: ()=> import('./modules/pages/qr-code-activate/qr-code-activate.module').then(m => m.QrCodeActivateModule)
  },
  {
    path: 'users',
    component: UsersComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
