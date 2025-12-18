import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Stock } from 'src/stocks/models';
import { TinkoffSearchResults } from './models';

@Injectable()
export class TinkoffService {
  baseUrl = 'https://invest-public-api.tinkoff.ru/rest';

  private readonly boards = ['TQBR', 'TQOB', 'TQCB', 'TQTF'];

  private readonly token = this.configService.get<string>('TINKOFF_TOKEN');

  constructor(private httpService: HttpService, private configService: ConfigService) {}

  search(query: string): Observable<Stock[]> {
    if (!query) {
      return of([]);
    }
    let url = `${this.baseUrl}/tinkoff.public.invest.api.contract.v1.InstrumentsService/FindInstrument`;

    return this.httpService
      .post<TinkoffSearchResults>(
        url,
        {
          query
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      )
      .pipe(
        map((response) => response.data),
        map((respData: TinkoffSearchResults) => {
          return respData.instruments
            .filter((i) => this.boards.includes(i.classCode))
            .map((i) => ({
              name: i.name,
              symbol: i.ticker
              // raw: i
            }));
        })
      );
  }
}
