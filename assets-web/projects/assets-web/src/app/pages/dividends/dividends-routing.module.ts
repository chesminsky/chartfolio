import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { DividendsComponent } from './dividends/dividends.component';

const routes: Routes = [
  {
    path: '',
    data: { title: marker('anms.menu.dividends'), description: marker('anms.description.dividends') },
    children: [{
      path: '',
      component: DividendsComponent
    }, {
      path: ':id',
      component: DividendsComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DividendsRoutingModule {}
