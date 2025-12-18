import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AppState } from '../core.module';
import { AssetType } from '../data/data.enum';
import { selectAssets } from '../data/data.selectors';
import { StockInfo } from '../stocks/stocks.model';
import { StocksService } from '../stocks/stocks.service';

@Injectable({
  providedIn: 'root'
})
export class StockPriceResolver  {
  constructor(private store: Store<AppState>, private ss: StocksService) {}

  resolve() {
    return this.store.select(selectAssets).pipe(
      filter(assets => Boolean(assets)),
      switchMap(assets => {
        const stocks = assets.filter(a => a.type === AssetType.Stocks).map(a => a.code);
        if (!stocks.length) {
          return of([]);
        }
        return this.ss.getStocksPrices(stocks, AssetType.Stocks);
      }),
      catchError(() => of([])),
      take(1)
    );
  }
}
