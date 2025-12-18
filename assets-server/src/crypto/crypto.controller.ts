import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { apiUrl } from 'src/config';
import { CryptoService } from './crypto.service';
import { Coin, CoinPrice } from './models';
import { Errors } from 'src/errors-enum';

const cryptoError = (): OperatorFunction<any, any> =>
  catchError(() => {
    return throwError(
      () =>
        new InternalServerErrorException({
          message: Errors.API_CRYPTO
        })
    );
  });

@Controller(`${apiUrl}/crypto`)
export class CryptoController {
  constructor(private cs: CryptoService) {}

  @Get(`price`)
  getPrice(@Query('ids') ids: string): Observable<CoinPrice> {
    return this.cs.getPrice(ids).pipe(cryptoError());
  }

  @Get(`search`)
  search(@Query('query') query: string): Observable<Coin[]> {
    return this.cs.search(query).pipe(cryptoError());
  }
}
