import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioRoutingModule } from './portfolio-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
import { ItemComponent } from './item/item.component';
import { AssetComponent } from './asset/asset.component';
import { NewComponent } from './new/new.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { CustomErrorStateMatcher } from '../../core/error-handler/custom-error-matcher';

@NgModule({
  declarations: [ListComponent, ItemComponent, AssetComponent, NewComponent],
  imports: [CommonModule, SharedModule, PortfolioRoutingModule],
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: CustomErrorStateMatcher
    }
  ]
})
export class PortfolioModule {}
