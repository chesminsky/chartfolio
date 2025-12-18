import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DividendInfo, Stock, StockInfo } from './stocks.model';
import { AssetType } from '../data/data.enum';

export const ASSETS_KEY = 'ASSETS';

@Injectable({
  providedIn: 'root'
})
export class StocksService {
  private stockInfoMap$: Map<string, Observable<StockInfo>> = new Map();
  private dividendsMap$: Map<string, Observable<Array<DividendInfo>>> = new Map();

  constructor(private http: HttpClient) {}

  clearCache(): void {
    this.stockInfoMap$ = new Map();
  }

  searchStocks(term: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(environment.apiUrl + '/stocks/search?term=' + term);
  }

  searchStocksMoex(term: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(environment.apiUrl + '/moex/search?term=' + term);
  }

  getDividendInfo(symbol: string, type: AssetType): Observable<Array<DividendInfo>> {
    if (!this.dividendsMap$.get(symbol)) {
      this.dividendsMap$.set(
        symbol,
        this.http
          .get<Array<DividendInfo>>(`${environment.apiUrl}/${type}/dividend/${symbol}`)
          .pipe(shareReplay({ refCount: true, bufferSize: 1 }))
      );
    }
    return this.dividendsMap$.get(symbol);
  }

  getStockPrice(symbol: string, type: AssetType): Observable<StockInfo> {
    if (!this.stockInfoMap$.get(symbol)) {
      this.stockInfoMap$.set(
        symbol,
        this.http
          .get<StockInfo>(`${environment.apiUrl}/${type}/quote/${symbol}`)
          .pipe(shareReplay({ refCount: true, bufferSize: 1 }))
      );
    }
    return this.stockInfoMap$.get(symbol);
  }

  getStocksPrices(symbols: string[], type: AssetType): Observable<StockInfo[]> {
    return this.http.post<StockInfo[]>(`${environment.apiUrl}/${type}/quote`, symbols).pipe(
      tap(stocksInfo => {
        stocksInfo.forEach(s => this.stockInfoMap$.set(s.symbol, of(s)));
      })
    );
  }
}
