import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CryptoService } from '../crypto/crypto.service';
import { actionUpdateAsset } from '../data/data.actions';
import { AssetType } from '../data/data.enum';
import { Asset } from '../data/data.model';
import { selectSettingsCurrency } from '../settings/settings.selectors';
import { StocksService } from '../stocks/stocks.service';
import { Currency, Rate } from './currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = environment.apiUrl;
  private baseUrl = 'currency';
  private rates$: Map<string, Observable<Rate>> = new Map();
  private prices$ = new Map<Asset, Observable<number>>();
  private currency$ = this.store.pipe(select(selectSettingsCurrency));

  constructor(private http: HttpClient, private ss: StocksService, private cs: CryptoService, private store: Store) {}

  clearCache(): void {
    this.rates$ = new Map();
    this.prices$ = new Map();
  }

  getList(): Observable<Currency[]> {
    return this.http
      .get<Currency[]>(`${this.apiUrl}/${this.baseUrl}/list`)
      .pipe(map(list => list.sort((a, b) => a.name.localeCompare(b.name))));
  }

  getRate(base: string): Observable<Rate> {
    if (!this.rates$.get(base)) {
      this.rates$.set(
        base,
        this.http.get<Rate>(`${this.apiUrl}/${this.baseUrl}/latest?base=${base}`).pipe(
          map((rate: Rate) => {
            rate.rates[base] = 1;
            return rate;
          }),
          shareReplay({ refCount: true, bufferSize: 1 })
        )
      );
    }
    return this.rates$.get(base);
  }

  getCurrencyRate(): Observable<Rate> {
    return this.currency$.pipe(switchMap(currency => this.getRate(currency)));
  }

  calcPrice(a: Asset): Observable<number> {
    if (!this.prices$.get(a)) {
      this.prices$.set(
        a,
        this.currency$.pipe(
          switchMap(currency => this.getRate(currency)),
          switchMap(rate => {
            if (a.type === AssetType.Currency) {
              return of(a.value / rate.rates[a.code]);
            }

            if (a.type === AssetType.Custom) {
              return of((a.value * a.price) / rate.rates[a.currency]);
            }

            if (a.type === AssetType.Stocks || a.type === AssetType.Moex) {
              return this.ss.getStockPrice(a.code, a.type).pipe(
                map(sp => {
                  if (!sp) {
                    return 0;
                  }
                  const r = rate.rates[sp.currency];
                  if (!r) {
                    return 0;
                  }

                  if (!a.name && sp.name) {
                    setTimeout(() => {
                      this.store.dispatch(actionUpdateAsset({ asset: { ...a, name: sp.name }, notify: false }));
                    });
                  }
                  return (a.value * sp.price) / r;
                })
              );
            }

            if (a.type === AssetType.Crypto) {
              return this.cs.getCryptoPrice(a.searchCode).pipe(
                map(cp => {
                  const r = rate.rates['USD'];
                  return (a.value * cp.price) / r;
                })
              );
            }

            return of(0);
          }),
          shareReplay({ refCount: true, bufferSize: 1 })
        )
      );
    }
    return this.prices$.get(a);
  }
}
