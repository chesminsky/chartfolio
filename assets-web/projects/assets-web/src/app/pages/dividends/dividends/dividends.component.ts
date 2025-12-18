import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl, Validators } from '@angular/forms';

import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Store, select } from '@ngrx/store';
import { getMonth, getYear } from 'date-fns';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { delay, filter, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { ROUTE_ANIMATIONS_ELEMENTS, selectIsAuthenticated } from '../../../core/core.module';
import { CurrencyService } from '../../../core/currency/currency.service';
import { AssetType } from '../../../core/data/data.enum';
import { Asset } from '../../../core/data/data.model';
import { selectAssets } from '../../../core/data/data.selectors';
import { StocksService } from '../../../core/stocks/stocks.service';
import { getColor, getCurrencyFormat } from '../../../shared/helper';
import { StackedItem } from '../stacked-bars/stacked-bars.component';

const ALL = 'all';

type DividendCalendar = Array<StackedItem>;
type DividendCalendarMonths = Array<{
  month: string;
  items: Array<StackedItem>;
}>;

@Component({
  selector: 'anms-dividends',
  templateUrl: './dividends.component.html',
  styleUrls: ['./dividends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividendsComponent implements OnInit {
  data: Asset[];
  id: string;
  name: string;
  currency: string;
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  priceMap: Map<string, number>;
  selectedPortfolioCtrl = new UntypedFormControl();
  selectedYearCtrl = new FormControl<string>(getYear(new Date()).toString());
  taxCtrl = new FormControl(true);
  taxValueCtrl = new FormControl(13, [Validators.min(0), Validators.max(100)]);
  portfolios$: Observable<Array<Asset>> = this.store
    .select(selectAssets)
    .pipe(map(assets => [...assets.filter(a => !a.parentId)]));
  defaultWalletId$ = this.portfolios$.pipe(map(wallets => wallets[0]?._id));
  isAuthenticated$: Observable<boolean> = this.store.pipe(select(selectIsAuthenticated));
  allCode = ALL;

  dividentCalendarYear$: Observable<DividendCalendar>;
  dividentCalendarByMonths$: Observable<DividendCalendarMonths>;

  allYears$: Observable<string[]>;
  totalDividends$: Observable<number>;

  months = [
    marker('shared.months.january'),
    marker('shared.months.february'),
    marker('shared.months.march'),
    marker('shared.months.april'),
    marker('shared.months.may'),
    marker('shared.months.june'),
    marker('shared.months.july'),
    marker('shared.months.august'),
    marker('shared.months.september'),
    marker('shared.months.october'),
    marker('shared.months.november'),
    marker('shared.months.december')
  ];

  getCurrencyFormat = getCurrencyFormat;
  getColor = getColor;

  private assets$ = this.store.pipe(select(selectAssets));
  private dividentCalendar$: Observable<DividendCalendar>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private cs: CurrencyService,
    private ss: StocksService
  ) {}

  ngOnInit() {
    this.dividentCalendar$ = combineLatest([this.cs.getCurrencyRate(), this.route.params, this.assets$]).pipe(
      delay(500),
      switchMap(([rate, params, assets]) => {
        this.id = params.id;
        this.selectedPortfolioCtrl.setValue(this.id || ALL);
        const portfolio = assets.find(a => a._id === this.id);
        this.name = portfolio?.name;
        this.currency = rate.base;

        const assetsList = assets
          .filter(
            a =>
              a.code &&
              a._id &&
              [AssetType.Moex, AssetType.Stocks].includes(a.type) &&
              (this.id ? a.parentId === this.id : true)
          )
          .reduce((acc, item) => {
            const found = acc.find(a => a.code === item.code);
            if (!found) {
              acc.push({ ...item });
            } else {
              found.value += item.value;
            }
            return acc;
          }, []);

        if (!assetsList.length) {
          return of([]);
        }

        const toLoad$ = assetsList.map(a => this.ss.getDividendInfo(a.code, a.type).pipe(take(1)));

        return forkJoin(toLoad$).pipe(
          map(arr =>
            arr.flat().map(item => {
              const asset = assetsList.find(a => a.code === item.code);
              const r = rate.rates[item.currency];

              return {
                ...item,
                value: (asset.value * item.value) / r,
                currency: rate.base
              };
            })
          )
        );
      }),
      shareReplay(1)
    );

    this.dividentCalendarYear$ = combineLatest([
      this.selectedYearCtrl.valueChanges.pipe(startWith(this.selectedYearCtrl.value)),
      this.taxCtrl.valueChanges.pipe(startWith(this.taxCtrl.value)),
      this.taxValueCtrl.valueChanges.pipe(
        startWith(this.taxValueCtrl.value),
        filter(() => this.taxValueCtrl.valid)
      )
    ]).pipe(
      switchMap(([year, tax, taxValue]) =>
        this.dividentCalendar$.pipe(
          map(all =>
            all
              .filter(i => getYear(new Date(i.date)) === +year)
              .map(i => {
                const value = tax ? +i.value * (1 - taxValue / 100) : i.value;
                return {
                  ...i,
                  value
                };
              })
          )
        )
      )
    );

    this.totalDividends$ = this.dividentCalendarYear$.pipe(
      map(all => all.reduce((acc, item) => acc + Number(item.value), 0))
    );

    this.allYears$ = this.dividentCalendar$.pipe(
      map(all => {
        const years = all.reduce((acc, item) => {
          const year = item.year;
          if (!acc.includes(year)) {
            acc.push(year);
          }
          return acc;
        }, []);

        return years.sort((a, b) => +b - +a);
      })
    );

    this.dividentCalendarByMonths$ = this.dividentCalendarYear$.pipe(
      map(all => {
        const months = all.reduce((acc, item) => {
          const month = getMonth(new Date(item.date));
          if (!acc.includes(month)) {
            acc.push(month);
          }
          return acc;
        }, []);

        return months
          .sort((a, b) => a - b)
          .map(month => {
            const items = all
              .filter(i => getMonth(new Date(i.date)) === month)
              .sort((a, b) => +new Date(a.date) - +new Date(b.date));
            return {
              month,
              items
            };
          });
      })
    );
  }

  onChangePortfolio(e: MatSelectChange): void {
    if (e.value === ALL) {
      this.router.navigate(['/dividends']);
    } else {
      this.router.navigate(['/dividends', e.value]);
    }
  }
}
