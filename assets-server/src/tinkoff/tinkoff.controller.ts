import { CacheTTL, Controller, Get, InternalServerErrorException, Query, UseInterceptors } from '@nestjs/common';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { apiUrl } from 'src/config';
import { TinkoffService } from './tinkoff.service';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { Errors } from 'src/errors-enum';
import { DAY } from 'src/helpers';
import { Stock } from 'src/stocks/models';

const tinkoffError = (): OperatorFunction<any, any> =>
  catchError(() => {
    return throwError(
      () =>
        new InternalServerErrorException({
          message: Errors.API_TINKOFF
        })
    );
  });

@Controller(`${apiUrl}/tinkoff`)
export class TinkoffController {
  constructor(private ts: TinkoffService) {}

  @Get(`search`)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(DAY)
  search(@Query() query: { term: string }): Observable<Stock[]> {
    return this.ts.search(query.term).pipe(tinkoffError());
  }

}
