import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AssetComponent } from './asset/asset.component';
import { ItemComponent } from './item/item.component';
import { ListComponent } from './list/list.component';
import { NewComponent } from './new/new.component';

const routes: Routes = [
  {
    path: '',
    data: { title: marker('anms.menu.portfolios') },
    children: [
      {
        path: '',
        component: ListComponent
      },
      {
        path: 'edit/:id',
        component: ItemComponent
      },
      {
        path: 'new',
        component: NewComponent
      },
      {
        path: 'edit/:id/:assetId',
        component: AssetComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule {}
