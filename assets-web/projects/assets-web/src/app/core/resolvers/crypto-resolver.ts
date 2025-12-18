import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AppState } from '../core.module';
import { CoinPrice } from '../crypto/crypto.model';
import { CryptoService } from '../crypto/crypto.service';
import { AssetType } from '../data/data.enum';
import { selectAssets } from '../data/data.selectors';

@Injectable({
  providedIn: 'root'
})
export class CryptoPriceResolver  {
  constructor(private store: Store<AppState>, private cs: CryptoService) {}

  resolve() {
    return this.store.select(selectAssets).pipe(
      filter(assets => Boolean(assets)),
      switchMap(assets => {
        const cryptos = assets.filter(a => a.type === AssetType.Crypto).map(a => a.searchCode);
        if (!cryptos.length) {
          return of([]);
        }
        return this.cs.getCryptoPrices(cryptos);
      }),
      catchError(() => of([])),
      take(1)
    );
  }
}
