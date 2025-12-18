import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getYear, parse } from 'date-fns';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { Stock, StockInfo } from 'src/stocks/models';
import { DividendInfo, MoexCouponsResults, MoexDividendsResults, MoexSearchResults } from './models';

@Injectable()
export class MoexService {
  baseUrl = 'http://iss.moex.com/iss';

  private readonly boards = ['TQBR', 'TQOB', 'TQCB', 'TQTF'];
  private readonly groups = ['stock_shares', 'stock_bonds', 'stock_ppif'];
  private readonly TIMEOUT = 10000;

  private readonly proxy = {
    protocol: 'http',
    host: this.configService.get('PROXY_IP'),
    port: this.configService.get('PROXY_PORT'),
    auth: {
      username: this.configService.get('PROXY_USERNAME'),
      password: this.configService.get('PROXY_PASS')
    }
  };

  constructor(private httpService: HttpService, private configService: ConfigService) {}

  search(term: string): Observable<Stock[]> {
    if (!term) {
      return of([]);
    }
    let url = `${this.baseUrl}/securities.json?q=${term}`;

    return this.httpService.get<MoexSearchResults>(url, { proxy: this.proxy }).pipe(
      map((response) => response.data),
      map((respData: MoexSearchResults) => {
        const groupIndex = respData.securities.columns.findIndex((q) => q === 'group');
        const idIndex = respData.securities.columns.findIndex((q) => q === 'secid');
        const nameIndex = respData.securities.columns.findIndex((q) => q === 'shortname');
        return respData.securities.data
          .filter((q) => this.groups.includes(q[groupIndex]))
          .map((q) => ({ name: q[nameIndex], symbol: q[idIndex] }))
          .sort((a, b) => (a.symbol.toLowerCase() === term.toLowerCase() ? -1 : 1));
      })
    );
  }

  price(term: string): Observable<StockInfo[]> {
    if (!term) {
      return of([]);
    }
    let sharesUrl = `${this.baseUrl}/engines/stock/markets/shares/securities.json?securities=${term}`;
    let bondsUrl = `${this.baseUrl}/engines/stock/markets/bonds/securities.json?securities=${term}`;

    return this.httpService.get<MoexSearchResults>(sharesUrl, { proxy: this.proxy }).pipe(
      switchMap((response) =>
        response.data.securities.data.length
          ? of(response)
          : this.httpService.get<MoexSearchResults>(bondsUrl, { proxy: this.proxy })
      ),
      map((response) => response.data),
      map((respData: MoexSearchResults) => {
        return respData.securities.data
          .filter((q) => this.boards.includes(q[1]))
          .map((q) => ({
            name: q[2],
            symbol: q[0],
            currency: 'RUB',
            price: q[3]
          }));
      })
    );
  }

  coupons(code: string): Observable<Array<DividendInfo>> {
    if (!code) {
      return of([]);
    }
    const url = `${this.baseUrl}/securities/${code}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`;

    return this.httpService
      .get<MoexCouponsResults>(url, {
        proxy: this.proxy,
        timeout: this.TIMEOUT
      })
      .pipe(
        timeout(this.TIMEOUT),
        map((response) => response.data),
        map((respData: MoexCouponsResults) => {
          if (!respData[1]?.coupons) {
            return [];
          }
          return respData[1].coupons
            .filter((q) => q.value_rub)
            .map((q) => ({
              code: q.secid,
              date: parse(q.coupondate, 'yyyy-MM-dd', new Date()),
              year: q.coupondate.split('-')[0],
              value: q.value_rub / 10,
              currency: 'RUB'
            }))
            .filter((q) => +q.year >= getYear(new Date()) - 5);
        }),
        catchError(() => of([]))
      );
  }

  dividend(code: string): Observable<Array<DividendInfo>> {
    if (!code) {
      return of([]);
    }
    const url = `${this.baseUrl}/securities/${code}/dividends.json`;
    return this.httpService
      .get<MoexDividendsResults>(url, {
        proxy: this.proxy,
        timeout: this.TIMEOUT
      })
      .pipe(
        timeout(this.TIMEOUT),
        map((response) => response.data),
        map((respData: MoexDividendsResults) => {
          return respData.dividends.data
            .map((q) => ({
              code: q[0],
              date: parse(q[2], 'yyyy-MM-dd', new Date()),
              year: q[2].split('-')[0],
              value: q[3],
              currency: 'RUB'
            }))
            .filter((q) => +q.year >= getYear(new Date()) - 5);
        }),
        switchMap((dividends) => (dividends.length ? of(dividends) : this.coupons(code))),
        catchError(() => of([]))
      );
  }
}
