import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';

import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flatten } from 'lodash';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { read, utils } from 'xlsx';
import { selectCategories, selectCategoryMap } from '../../../core/categories/categories.selectors';
import { NotificationService } from '../../../core/core.module';
import { CurrencyService } from '../../../core/currency/currency.service';
import { actionDeleteAsset, actionUpdateAsset } from '../../../core/data/data.actions';
import { AssetType } from '../../../core/data/data.enum';
import { Asset } from '../../../core/data/data.model';
import { selectAssets } from '../../../core/data/data.selectors';
import { selectSettingsCurrency } from '../../../core/settings/settings.selectors';
import { selectUser } from '../../../core/user/user.selectors';
import { getCurrencyFormat, placeCaretAtEnd } from '../../../shared/helper';
import { CATEGORIES_TRANSLATIONS, OPTIONS_TRANSLATIONS } from '../../categories/translations';

@Component({
  selector: 'anms-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {
  @ViewChild('fileInput')
  fileInputRef: ElementRef;

  @ViewChild('editName')
  private inputRef: ElementRef<HTMLElement>;

  currency$ = this.store.pipe(select(selectSettingsCurrency));
  displayedColumns: string[] = ['code', 'name', 'value', 'price', 'categories', 'delete'];
  portfolios$: Observable<Array<Asset>> = this.store
    .select(selectAssets)
    .pipe(map(assets => assets.filter(a => !a.parentId)));
  selectedPortfolioCtrl = new UntypedFormControl();
  loadedAssets: Asset[];
  assets$ = this.route.params.pipe(
    filter(v => Boolean(v)),
    switchMap(p =>
      this.store.pipe(
        select(selectAssets),
        map(assets => assets.filter(a => a.parentId === p.id)),
        tap(assets => (this.loadedAssets = assets))
      )
    )
  );
  selectedAsset$ = this.route.params.pipe(
    filter(v => Boolean(v)),
    switchMap(p =>
      this.store.pipe(
        select(selectAssets),
        map(assets => assets.find(a => a._id === p.id)),
        tap(a => this.assetNameCtrl.setValue(a.name))
      )
    )
  );
  categories$ = this.store.select(selectCategories);
  categoryMap$ = this.store.select(selectCategoryMap);
  allOptions$ = this.categories$.pipe(map(cats => flatten(cats.map(c => c.options))));
  userplan$ = this.store.select(selectUser).pipe(map(u => u?.plan));

  mobileActionsRow: Asset;

  assetNameCtrl = new UntypedFormControl('', Validators.required);
  assetNameEdit = false;
  getCurrencyFormat = getCurrencyFormat;
  readonly CATEGORIES_TRANSLATIONS = CATEGORIES_TRANSLATIONS;
  readonly OPTIONS_TRANSLATIONS = OPTIONS_TRANSLATIONS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private cs: CurrencyService,
    private ns: NotificationService,
    private ts: TranslateService,
    private translate: TranslateService
  ) {}

  submitName(e: Event, selectedAsset: Asset): void {
    e.preventDefault();
    if (this.assetNameCtrl.invalid) {
      return;
    }

    this.store.dispatch(
      actionUpdateAsset({ asset: { ...selectedAsset, name: this.assetNameCtrl.value.trim() }, notify: false })
    );
    setTimeout(() => {
      this.assetNameEdit = false;
    });
  }

  editName(): void {
    this.assetNameEdit = true;
    setTimeout(() => {
      placeCaretAtEnd(this.inputRef.nativeElement);
    });
  }

  back(): void {
    this.router.navigate(['portfolios']);
  }

  toNew(): void {
    this.router.navigate(['portfolios/edit', this.selectedPortfolioCtrl.value, 'new']);
  }

  toAsset(row: Asset): void {
    if (this.mobileActionsRow !== row) {
      this.router.navigate([row._id], { relativeTo: this.route });
    }
  }

  onSwipeLeft(e: Event, row: Asset) {
    this.mobileActionsRow = row;
  }

  onSwipeRight(e: Event, row: Asset) {
    this.mobileActionsRow = null;
  }

  getTags(a: Asset): Observable<string[]> {
    return combineLatest([this.categoryMap$, this.allOptions$]).pipe(
      map(([cm, opts]) => {
        if (!cm[a.code]) {
          return null;
        }

        return Object.keys(cm[a.code]).map(catId =>
          Object.keys(cm[a.code][catId])
            .map(code => {
              const oo = opts.find(o => o.code === code);
              return this.getChipLabel(oo.code, oo.name);
            })
            .join(', ')
        );
      })
    );
  }

  onChangePortfolio(e: MatSelectChange): void {
    this.router.navigate(['/portfolios/edit', e.value]);
  }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.selectedPortfolioCtrl.setValue(p.id);
    });
  }

  calcPrice(a: Asset): Observable<number> {
    return this.cs.calcPrice(a);
  }

  calcTotalPrice(): Observable<number> {
    return this.assets$.pipe(
      switchMap(assets => combineLatest(assets.map(a => this.calcPrice(a)))),
      map(prices => prices.reduce((acc, p) => acc + p, 0))
    );
  }

  deleteAsset(e: MouseEvent, asset: Asset): void {
    e.stopPropagation();
    this.store.dispatch(actionDeleteAsset({ ids: [asset._id] }));
  }

  deleteAll() {
    if (this.loadedAssets.length > 0) {
      this.store.dispatch(actionDeleteAsset({ ids: this.loadedAssets.map(a => a._id) }));
    }
  }

  insertRows(rows: (string | number)[][]) {
    rows
      .filter(row => !isNaN(Number(row[11])) && Number(row[11]) > 0)
      .forEach(row => {
        const code = String(row[0]);
        const value = Number(row[11]);
        const asset: Asset = {
          code,
          value,
          parentId: this.selectedPortfolioCtrl.value,
          type: AssetType.Stocks
        };

        if (code.slice(0, 2) === '$$') {
          return;
        }
        this.store.dispatch(
          actionUpdateAsset({
            asset,
            notify: false
          })
        );
      });
  }

  /**
   * Загрузка значений
   */
  onLoadValues(e: Event): void {
    const file = (<HTMLInputElement>e.target).files[0];

    if (!file) {
      return;
    }
    const fr: FileReader = new FileReader();
    const ext = file.name.split('.').pop();

    const applyValues = (rows: (string | number)[][]) => {
      if (!rows.length) {
        return;
      }
      rows.splice(0, 1);
      console.log('values', rows);

      this.deleteAll();
      setTimeout(() => {
        this.insertRows(rows);
      });
    };

    const onError = () => {
      this.ns.error(this.ts.instant('anms.notification.file-error'));
    };

    const load = (type: 'string' | 'binary'): void => {
      const wb = read(fr.result as string, { type });
      const wsname: string = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rows = utils.sheet_to_json<string[]>(ws, { header: 1 });
      const set = new Set<string>();
      applyValues(rows);
    };

    if (ext === 'csv') {
      fr.readAsText(file);
      fr.onloadend = () => {
        try {
          load('string');
        } catch (error) {
          onError();
        }
      };
    } else if (ext === 'xlsx') {
      fr.readAsBinaryString(file);
      fr.onloadend = () => {
        try {
          load('binary');
        } catch (error) {
          onError();
        }
      };
    } else {
      this.ns.error(this.ts.instant('anms.notification.file-format-error'));
    }

    this.fileInputRef.nativeElement.value = '';
  }

  private getChipLabel( optionCode: string, optionName: string): string {
    return OPTIONS_TRANSLATIONS[optionCode]
      ? this.translate.instant(OPTIONS_TRANSLATIONS[optionCode])
      : optionName;
  }
}
