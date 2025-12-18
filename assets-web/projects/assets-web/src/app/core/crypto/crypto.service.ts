import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Coin, CoinPrice, CoinPrices } from './crypto.model';

export const ASSETS_KEY = 'ASSETS';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private cp$: Map<string, Observable<CoinPrice>> = new Map();

  constructor(private http: HttpClient) {}

  clearCache(): void {
    this.cp$ = new Map();
  }

  searchCrypto(query: string): Observable<Coin[]> {
    return this.http.get<Coin[]>(environment.apiUrl + '/crypto/search?query=' + query);
  }

  getCryptoPrice(symbol: string): Observable<CoinPrice> {
    if (!this.cp$.get(symbol)) {
      this.cp$.set(
        symbol,
        this.http.get<CoinPrices>(environment.apiUrl + '/crypto/price?ids=' + symbol).pipe(
          map(prices => ({ symbol, price: prices[symbol].usd })),
          shareReplay({ refCount: true, bufferSize: 1 })
        )
      );
    }
    return this.cp$.get(symbol);
  }

  getCryptoPrices(symbols: string[]): Observable<CoinPrice[]> {
    return this.http.get<CoinPrices>(environment.apiUrl + '/crypto/price?ids=' + symbols.join(',')).pipe(
      map(prices => Object.keys(prices).map(symbol => ({ symbol, price: prices[symbol].usd }))),
      tap(prices => {
        prices.forEach(s => this.cp$.set(s.symbol, of(s)));
      })
    );
  }
}
