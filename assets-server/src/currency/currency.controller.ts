import { CacheTTL, Controller, Get, InternalServerErrorException, Query, UseInterceptors } from '@nestjs/common';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { apiUrl } from 'src/config';
import { DAY, MONTH } from 'src/helpers';
import { CurrencyService } from './currency.service';
import { Currency, Rate } from './models';
import { Errors } from 'src/errors-enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

const currencyError = (): OperatorFunction<any, any> =>
  catchError(() => {
    return throwError(
      () =>
        new InternalServerErrorException({
          message: Errors.API_CURRENCY
        })
    );
  });

@Controller(`${apiUrl}/currency`)
export class CurrencyController {
  constructor(private cs: CurrencyService) {}

  @Get(`latest`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  getLatest(@Query() query: { base: string }): Observable<Rate> {
    return this.cs.getLatest(query.base).pipe(currencyError());
  }

  @Get(`list`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(MONTH)
  getList(): Observable<Currency[]> {
    return this.cs.getCurrencies().pipe(currencyError());
  }
}
