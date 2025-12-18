import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Coin, CoinPrice } from './models';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CryptoService {
  baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(private httpService: HttpService) {}

  getPrice(ids: string): Observable<CoinPrice> {
    return this.httpService
      .get<CoinPrice>(`${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd`)
      .pipe(map(response => response.data));
  }

  search(query: string): Observable<Coin[]> {
    return this.httpService
      .get<{ coins: Coin[] }>(`${this.baseUrl}/search?query=${query}`)
      .pipe(map(response => response.data.coins.slice(0, 10)));
  }
}
