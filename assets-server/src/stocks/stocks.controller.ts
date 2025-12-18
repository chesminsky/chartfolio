import { Body, Controller, Get, HttpCode, InternalServerErrorException, Param, Post, Query } from '@nestjs/common';
import { Observable, OperatorFunction, catchError, from, map, of, throwError } from 'rxjs';
import { apiUrl } from 'src/config';
import { Errors } from 'src/errors-enum';
import { DividendInfo } from 'src/moex/models';
import yahooFinance from 'yahoo-finance2';
import { HistoricalDividendsResult } from 'yahoo-finance2/dist/esm/src/modules/historical';
import { Quote } from 'yahoo-finance2/dist/esm/src/modules/quote';
import { Stock, StockInfo } from './models';
import { StocksService } from './stocks.service';

const yahooError = (): OperatorFunction<any, any> =>
  catchError(() => {
    return throwError(
      () =>
        new InternalServerErrorException({
          message: Errors.API_YAHOO
        })
    );
  });

@Controller(`${apiUrl}/stocks`)
export class StocksController {
  constructor(private ss: StocksService) {}

  private mapQuote(quote: Quote): StockInfo {
    return {
      price: quote.regularMarketPrice,
      currency: quote.currency,
      name: quote.longName,
      symbol: quote.symbol
    };
  }

  @Get(`search`)
  getLatest(@Query() query: { term: string }): Observable<Stock[]> {
    return this.ss.search(query.term).pipe(yahooError());
  }

  @Get(`quote/:symbol`)
  quote(@Param('symbol') symbol: string): Observable<StockInfo> {
    return from(yahooFinance.quote(symbol)).pipe(map(this.mapQuote), yahooError());
  }

  @Post(`quote`)
  @HttpCode(200)
  quotes(@Body() symbols: string[]): Observable<StockInfo[]> {
    return from(yahooFinance.quote(symbols)).pipe(
      map((quote: Quote[]) => quote.map(this.mapQuote)),
      yahooError()
    );
  }

  @Get(`dividend/:symbol`)
  dividend(@Param('symbol') symbol: string): Observable<DividendInfo[]> {
    return from(
      yahooFinance.historical(symbol, {
        period1: new Date(new Date().getFullYear() - 5, 0, 1),
        events: 'dividends',
        interval: '1d',
        includeAdjustedClose: true
      })
    ).pipe(
      catchError(() => of([])),
      map((list: HistoricalDividendsResult): DividendInfo[] =>
        list.map((q) => ({
          date: q.date,
          value: q.dividends,
          code: symbol,
          year: q.date.getFullYear().toString(),
          currency: 'USD'
        }))
      )
    );
  }
}
