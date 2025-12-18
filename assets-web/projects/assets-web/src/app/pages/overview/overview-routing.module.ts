import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
  {
    path: '',
    data: { title: marker('anms.menu.overview'), description: marker('anms.description.overview') },
    children: [{
      path: '',
      component: OverviewComponent
    }, {
      path: ':id',
      component: OverviewComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverviewRoutingModule {}
