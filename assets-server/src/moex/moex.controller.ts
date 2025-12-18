import { Body, CacheTTL, Controller, Get, HttpCode, InternalServerErrorException, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { Observable, OperatorFunction, catchError, map, throwError } from 'rxjs';
import { apiUrl } from 'src/config';
import { MoexService } from './moex.service';

import { Errors } from 'src/errors-enum';
import { Stock, StockInfo } from 'src/stocks/models';
import { DAY } from 'src/helpers';
import { CacheInterceptor } from '@nestjs/cache-manager';

const moexError = (): OperatorFunction<any, any> =>
  catchError(() => {
    return throwError(
      () =>
        new InternalServerErrorException({
          message: Errors.API_MOEX
        })
    );
  });

@Controller(`${apiUrl}/moex`)
export class MoexController {
  constructor(private ms: MoexService) {}

  @Get(`search`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  getLatest(@Query() query: { term: string }): Observable<Stock[]> {
    return this.ms.search(query.term).pipe(moexError());
  }

  @Get(`quote/:symbol`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  quote(@Param('symbol') symbol: string): Observable<StockInfo> {
    return this.ms.price(symbol).pipe(map((info) => info[0])).pipe(moexError());
  }

  @Post(`quote`)
  @HttpCode(200)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  quotes(@Body() symbols: string[]): Observable<StockInfo[]> {
    return this.ms.price(symbols.join(',')).pipe(moexError());
  }

  @Get(`dividend/:symbol`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  dividend(@Param('symbol') symbol: string): Observable<any> {
    return this.ms.dividend(symbol).pipe(moexError());
  }
}
