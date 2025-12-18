import { Injectable } from '@nestjs/common';
import { Currency, CurrencyApiLatest, CurrencyApiList, Rate } from './models';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
  private baseUrl = 'https://api.currencyapi.com/v3';
  private apiKey = this.configService.get('CURRENCY_TOKEN');
  private apiKey2 = this.configService.get('CURRENCY_TOKEN_RESERVE');

  private getEndpoint(path: string, apiKey: string): string {
    return `${this.baseUrl}/${path}?apikey=${apiKey}`;
  }

  constructor(private httpService: HttpService, private configService: ConfigService) {}

  getLatest(baseCurrency?: string): Observable<Rate> {
    const getUrl = (apiKey: string) => {
      let url = this.getEndpoint('latest', apiKey);
      if (baseCurrency) {
        url += `&base_currency=${baseCurrency}`;
      }
      return url;
    };

    return this.httpService.get<CurrencyApiLatest>(getUrl(this.apiKey)).pipe(
      catchError(() => this.httpService.get<CurrencyApiLatest>(getUrl(this.apiKey2))),
      map((response) => response.data),
      map((respData: CurrencyApiLatest) => {
        const rates: { [key: string]: number } = {};
        Object.keys(respData.data).forEach((key) => {
          rates[key] = respData.data[key].value;
        });
        return {
          base: baseCurrency,
          date: new Date(respData.meta.last_updated_at).toISOString(),
          rates
        };
      })
    );
  }

  getCurrencies(): Observable<Currency[]> {
    const getUrl = (apiKey: string) => {
      return this.getEndpoint('currencies', apiKey);
    };

    return this.httpService.get<CurrencyApiList>(getUrl(this.apiKey)).pipe(
      catchError(() => this.httpService.get<CurrencyApiLatest>(getUrl(this.apiKey2))),
      map((response) => response.data),
      map((respData: CurrencyApiList) => {
        const out = Object.keys(respData.data)
          .map((code) => {
            return {
              code,
              name: respData.data[code]?.name
            };
          })
          .filter((c) => c.name);

        const btcIndex = out.findIndex((o) => o.code === 'BTC');
        if (btcIndex > -1) {
          return out.slice(0, btcIndex + 1);
        } else {
          return out;
        }
      })
    );
  }
}
