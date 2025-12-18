import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { DividendsComponent } from './dividends/dividends.component';
import { DividendsRoutingModule } from './dividends-routing.module';

@NgModule({
  declarations: [DividendsComponent],
  imports: [CommonModule, SharedModule, DividendsRoutingModule]
})
export class DividendsModule {}
