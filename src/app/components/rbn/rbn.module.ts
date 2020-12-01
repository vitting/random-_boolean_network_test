import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RbnRoutingModule } from "./rbn-routing.module";
import { RbnComponent } from "./rbn.component";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [RbnComponent],
  imports: [
    CommonModule,
    RbnRoutingModule,
    FormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
})
export class RbnModule {}
