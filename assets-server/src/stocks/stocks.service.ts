import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Stock, YahooFinanceSearch } from './models';

@Injectable()
export class StocksService {
  baseUrl = 'https://query1.finance.yahoo.com/v1/finance';

  constructor(private httpService: HttpService) {}

  search(term: string): Observable<Stock[]> {
    if (!term) {
      return of([]);
    }
    let url = `${this.baseUrl}/search?q=${term}`;

    url +=
      '&lang=en-US&region=US&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&researchReportsCount=2';

    return this.httpService.get<YahooFinanceSearch>(url).pipe(
      map((response) => response.data),
      map((respData: YahooFinanceSearch) => {
        return respData.quotes.map((q) => ({ name: q.shortname, symbol: q.symbol }));
      })
    );
  }
}
