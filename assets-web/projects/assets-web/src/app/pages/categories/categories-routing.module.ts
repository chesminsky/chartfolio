import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { CategoriesComponent } from './item/categories.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: '',
    data: { title: marker('anms.menu.categories') },
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: 'new',
        component: CategoriesComponent,
      },
      {
        path: 'edit/:id',
        component: CategoriesComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule {}
