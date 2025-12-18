import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './item/categories.component';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { CustomErrorStateMatcher } from '../../core/error-handler/custom-error-matcher';

@NgModule({
  declarations: [CategoriesComponent, ListComponent],
  imports: [CommonModule, SharedModule, CategoriesRoutingModule],
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: CustomErrorStateMatcher
    }
  ]
})
export class CategoriesModule {}
