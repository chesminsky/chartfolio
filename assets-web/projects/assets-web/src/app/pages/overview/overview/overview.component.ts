import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { flatten } from 'lodash';
import { cloneDeep } from 'lodash-es';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import { Category, CategoryMap } from '../../../core/categories/categories.model';
import { selectCategories, selectCategoryMap } from '../../../core/categories/categories.selectors';
import { LocalStorageService, ROUTE_ANIMATIONS_ELEMENTS, selectIsAuthenticated } from '../../../core/core.module';
import { CurrencyService } from '../../../core/currency/currency.service';
import { Asset } from '../../../core/data/data.model';
import { selectAssets } from '../../../core/data/data.selectors';
import { selectSettingsCurrency } from '../../../core/settings/settings.selectors';
import { CATEGORIES_TRANSLATIONS } from '../../categories/translations';

const ALL = 'all';
const GROUPING_KEY = 'GROUPING';

@Component({
  selector: 'anms-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {
  data: Asset[];
  id: string;
  name: string;
  currency: string;
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  priceMap: Map<string, number>;
  selectedPortfolioCtrl = new UntypedFormControl();
  selectedCategoryCtrl = new UntypedFormControl(0);
  portfolios$: Observable<Array<Asset>> = this.store
    .select(selectAssets)
    .pipe(map(assets => [...assets.filter(a => !a.parentId)]));
  defaultWalletId$ = this.portfolios$.pipe(map(wallets => wallets[0]?._id));
  categories$: Observable<Array<Category>> = this.store.select(selectCategories);

  allOptions$ = this.categories$.pipe(map(cats => flatten(cats.map(c => c.options))));
  categoryMap$ = this.store.select(selectCategoryMap);
  categoryMap: CategoryMap;
  isAuthenticated$: Observable<boolean> = this.store.pipe(select(selectIsAuthenticated));
  allCode = ALL;
  CATEGORIES_TRANSLATIONS = CATEGORIES_TRANSLATIONS;

  private allTree: Asset[];
  private destroyRef = inject(DestroyRef);
  private currency$ = this.store.pipe(select(selectSettingsCurrency));
  private assets$ = this.store.pipe(select(selectAssets));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private store: Store,
    private cs: CurrencyService,
    private storageService: LocalStorageService
  ) {}

  get selectedCategoryId(): string {
    return this.selectedCategoryCtrl.value;
  }

  ngOnInit() {
    combineLatest([this.currency$, this.route.params, this.assets$, this.categoryMap$, this.categories$])
      .pipe(
        delay(500),
        switchMap(([currency, p, assets, categoryMap, categories]) => {
          this.id = p.id;
          this.selectedPortfolioCtrl.setValue(this.id || ALL);
          const portfolio = assets.find(a => a._id === this.id);
          this.name = portfolio?.name;

          const prefGrouping = this.storageService.getItem(GROUPING_KEY);
          if (prefGrouping && categories.find(c => c._id === prefGrouping)) {
            this.selectedCategoryCtrl.setValue(prefGrouping, { emitEvent: false });
          }

          const allList: Asset[] = cloneDeep(assets).sort((a, b) => (a.value ? -1 : 1));
          const toLoad = allList.filter(a => a.code && a._id).map(a => this.cs.calcPrice(a).pipe(take(1)));
          this.categoryMap = categoryMap;

          if (!toLoad.length) {
            return of([currency, p, allList, new Map()]);
          }

          return forkJoin(toLoad).pipe(
            map((prices: number[]) => {
              const priceMap = new Map<string, number>();
              prices.forEach((pp, i) => priceMap.set(allList[i]._id, pp));

              return [currency, p, allList, priceMap];
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([currency, p, allList, priceMap]: [string, Params, Asset[], Map<string, number>]) => {
        this.currency = currency;
        this.priceMap = priceMap;
        this.allTree = this.listToTree(allList, this.currency);

        if (this.id) {
          const g = this.getGroup(this.id);
          this.data = [].concat(g?.children || []);
        } else {
          this.data = [].concat(allList.filter(a => a.parentId));
        }
        this.cd.detectChanges();
      });

    this.selectedCategoryCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      if (v) {
        this.storageService.setItem(GROUPING_KEY, v);
      } else {
        this.storageService.removeItem(GROUPING_KEY);
      }
    });
  }

  onChangePortfolio(e: MatSelectChange): void {
    if (e.value === ALL) {
      this.router.navigate(['/overview']);
    } else {
      this.router.navigate(['/overview', e.value]);
    }
  }

  private getGroup(id: string) {
    let group;
    const traverse = (tree: Asset[]) => {
      for (const child of tree) {
        if (child._id === id) {
          group = child;
        }
        traverse(child.children);
      }
    };

    traverse(this.allTree);

    return group;
  }

  private listToTree(list: Asset[], currency: string): Asset[] {
    const assetMap = {};
    let asset: Asset;
    const roots = [];

    for (let i = 0; i < list.length; i += 1) {
      assetMap[list[i]._id] = i;
      list[i].children = [];

      if (!list[i].value) {
        list[i].value = 0;
      }
    }

    for (let i = 0; i < list.length; i += 1) {
      asset = list[i];
      if (!asset.code) {
        asset.code = currency;
      }
      if (asset.parentId !== null) {
        const parent = list[assetMap[asset.parentId]];
        if (parent) {
          parent.children.push(asset);
          parent.value += this.priceMap.get(asset._id); // wallet price
        }
      } else {
        roots.push(asset);
      }
    }
    return roots;
  }
}
