import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {QrCodeActivateComponent} from "./modules/pages/qr-code-activate/qr-code-activate.component";
import {TicketsComponent} from "./modules/pages/tickets/tickets.component";
import {AuthGuard} from "./modules/auth/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: QrCodeActivateComponent,
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
