import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RbnComponent } from "./components/rbn/rbn.component";

const routes: Routes = [{
  path: "",
  component: RbnComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
