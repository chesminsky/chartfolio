import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { cloneDeep, uniq } from 'lodash';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { actionUpdateCategoryMap } from '../../../core/categories/categories.actions';
import { AssetCategoryMap, Category, CategoryMap, Option } from '../../../core/categories/categories.model';
import { selectCategories, selectCategoryMap } from '../../../core/categories/categories.selectors';
import { GuessCategoryService } from '../../../core/categories/guess-categories.service';
import { Coin } from '../../../core/crypto/crypto.model';
import { CryptoService } from '../../../core/crypto/crypto.service';
import { actionDeleteAsset, actionUpdateAsset } from '../../../core/data/data.actions';
import { AssetType } from '../../../core/data/data.enum';
import { Asset } from '../../../core/data/data.model';
import { selectAssets, selectAssetsLoading, selectCurrencies } from '../../../core/data/data.selectors';
import { StocksService } from '../../../core/stocks/stocks.service';
import { TranslateService } from '@ngx-translate/core';
import { CATEGORIES_TRANSLATIONS, OPTIONS_TRANSLATIONS } from '../../categories/translations';

const validateOptionsSameName = () => (control: UntypedFormArray): ValidationErrors | null => {
  const arr = control.value.map(c => c.option);
  return arr.length === uniq(arr).length ? null : { optionsNotUnique: true };
};

const validateCategoriesSameName = () => (control: UntypedFormArray): ValidationErrors | null => {
  const arr = control.value.map(c => c.category);
  return arr.length === uniq(arr).length ? null : { categoriesNotUnique: true };
};

const validatePercentageSum = () => (control: UntypedFormArray): ValidationErrors | null => {
  const sum = control.value
    .map(c => c.percentage)
    .reduce((acc, curr) => {
      acc += Number(curr);
      return acc;
    }, 0);
  return sum === 100 ? null : { percentageSum: true };
};

@Component({
  selector: 'anms-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetComponent implements OnInit {
  categoriesCtrl = new UntypedFormArray([], validateCategoriesSameName());
  form: UntypedFormGroup;
  filteredAssetCurrencies: Observable<Asset[]>;
  filteredCurrencies: Observable<Asset[]>;
  filteredStocks: Observable<Asset[]>;
  filteredStocksMoex: Observable<Asset[]>;
  filteredCrypto: Observable<Asset[]>;
  AssetType = AssetType;
  compound = [];
  editMode: boolean;
  name: string;
  id: string;
  parentId: string;
  showCategoryForm = false;

  categories$ = this.store.select(selectCategories);
  categoryMap$ = this.store.select(selectCategoryMap);
  loading$ = this.store.select(selectAssetsLoading);
  guessLoading$ = new BehaviorSubject<boolean>(false);

  readonly CATEGORIES_TRANSLATIONS = CATEGORIES_TRANSLATIONS;
  readonly OPTIONS_TRANSLATIONS = OPTIONS_TRANSLATIONS;

  private typeCtrl = new UntypedFormControl('', Validators.required);
  private assetCtrl = new UntypedFormControl('', Validators.required);
  private assetValueCtrl = new UntypedFormControl('', Validators.required);
  private assetNameCtrl = new UntypedFormControl('', Validators.required);
  private assetPriceCtrl = new UntypedFormControl({ value: '', disabled: true }, Validators.required);
  private assetCurrencyCtrl = new UntypedFormControl({ value: '', disabled: true }, Validators.required);

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private ss: StocksService,
    private cs: CryptoService,
    private router: Router,
    private gs: GuessCategoryService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.params, this.categories$, this.categoryMap$])
      .pipe(
        switchMap(([p, categories, categoryMap]) => {
          this.editMode = p.assetId !== 'new';

          if (!p.assetId) {
            return of(null);
          }

          this.id = p.assetId;

          return this.store
            .select(selectAssets)
            .pipe(map(assets => [assets.find(a => a._id === p.assetId), categories, categoryMap]));
        }),
        take(1)
      )
      .subscribe(([a, categories, categoryMap]: [Asset, Category[], CategoryMap]) => {
        if (a) {
          this.name = a.name || a.code;
          this.parentId = a.parentId;
          this.typeCtrl.setValue(a.type);
          this.assetCtrl.setValue(a.type === AssetType.Custom ? a.code : a);
          this.assetValueCtrl.setValue(a.value);
          this.assetNameCtrl.setValue(a.name);
          if (a.type === AssetType.Custom) {
            this.assetPriceCtrl.setValue(a.price);
            this.assetCurrencyCtrl.setValue({ code: a.currency });
            this.assetCurrencyCtrl.enable();
            this.assetPriceCtrl.enable();
          }
          this.addCategories(a, categoryMap, categories, null);

          this.typeCtrl.disable();
          this.assetCtrl.disable();
        } else {
          this.typeCtrl.enable();
          this.assetCtrl.enable();
        }
      });

    this.form = new UntypedFormGroup({
      type: this.typeCtrl,
      asset: this.assetCtrl,
      assetValue: this.assetValueCtrl,
      assetName: this.assetNameCtrl,
      assetPrice: this.assetPriceCtrl,
      assetCurrency: this.assetCurrencyCtrl,
      categories: this.categoriesCtrl
    });

    this.typeCtrl.valueChanges.subscribe(this.onTypeSelect.bind(this));

    this.assetCtrl.valueChanges
      .pipe(
        tap(a => {
          if (!this.editMode) {
            if (a?.code) {
              this.assetNameCtrl.setValue(a.name);
            } else {
              this.assetNameCtrl.setValue('');
            }
          }
        }),
        filter(a => Boolean(a?.code)),
        tap(() => this.guessLoading$.next(true)),
        switchMap((a: Asset) => combineLatest([this.categories$, this.categoryMap$]).pipe(map(resp => [a, ...resp]))),
        switchMap(([a, categories, categoryMap]: [Asset, Category[], CategoryMap, Record<string, string>]) =>
          categoryMap[a.code] && Object.keys(categoryMap[a.code]).length
            ? of([a, categories, categoryMap, null])
            : this.gs
                .guessCategories(a.name, a.code, this.typeCtrl.value)
                .pipe(map(guessedCategories => [a, categories, categoryMap, guessedCategories]))
        )
      )
      .subscribe(
        ([a, categories, categoryMap, guessedCategories]: [Asset, Category[], CategoryMap, Record<string, string>]) => {
          if (!this.editMode) {
            this.categoriesCtrl.clear();
            this.addCategories(a, categoryMap, categories, guessedCategories);
            this.guessLoading$.next(false);
          }
        }
      );

    const getFilteredCurencies = (ctrl: FormControl) =>
      ctrl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value =>
          this.store.pipe(select(selectCurrencies)).pipe(
            map(list =>
              this.filterAssets(
                value,
                list.map(item => ({ code: item.code, name: item.name }))
              )
            )
          )
        )
      );

    this.filteredAssetCurrencies = getFilteredCurencies(this.assetCurrencyCtrl);
    this.filteredCurrencies = getFilteredCurencies(this.assetCtrl);

    this.filteredCrypto = this.assetCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | Asset) => {
        if ((value as Asset).name) {
          value = (value as Asset).name;
        }
        return this.cs
          .searchCrypto(value as string)
          .pipe(
            map((cl: Coin[]): Asset[] =>
              cl.map((c: Coin): Asset => ({ name: c.name, code: c.symbol, searchCode: c.id }))
            )
          );
      })
    );

    this.filteredStocks = this.assetCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | Asset) => {
        if ((value as Asset).name) {
          value = (value as Asset).name;
        }
        return this.ss.searchStocks(value as string).pipe(map(cl => cl.map(c => ({ name: c.name, code: c.symbol }))));
      })
    );

    this.filteredStocksMoex = this.assetCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | Asset) => {
        if ((value as Asset).name) {
          value = (value as Asset).name;
        }
        return this.ss
          .searchStocksMoex(value as string)
          .pipe(map(cl => cl.map(c => ({ name: c.name, code: c.symbol }))));
      })
    );
  }

  getOptionsFormArray(i: number): UntypedFormArray {
    return (this.categoriesCtrl.controls[i] as UntypedFormGroup).get('options') as UntypedFormArray;
  }

  getOptions(i: number) {
    return this.categoriesCtrl.value[i].category?.options || [];
  }

  getCategoriesList(categories: Category[]): Category[] {
    return categories.filter(c => !this.categoriesCtrl.value.slice(0, -1).find(cc => cc.category._id === c._id));
  }

  delete() {
    this.store.dispatch(actionDeleteAsset({ ids: [this.id], navigateUrl: `/portfolios/edit/${this.parentId}` }));
  }

  saveCategory(): void {
    this.showCategoryForm = false;
  }

  removeCategory(i: number): void {
    this.categoriesCtrl.removeAt(i);
    this.showCategoryForm = false;
  }

  clickAddCategory(): void {
    this.showCategoryForm = true;
    this.addCategory();
  }

  addCategory(
    category: Category = null,
    opts: Array<{ option: { name: string }; percentage: number }> = [{ option: null, percentage: 100 }]
  ): void {
    const fa = opts.map(
      o =>
        new UntypedFormGroup({
          option: new UntypedFormControl(o.option, Validators.required),
          percentage: new UntypedFormControl(o.percentage, Validators.required)
        })
    );

    this.categoriesCtrl.push(
      new UntypedFormGroup({
        category: new UntypedFormControl(category, Validators.required),
        options: new UntypedFormArray(fa, [validateOptionsSameName(), validatePercentageSum()])
      })
    );
  }

  back(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getChipLabel(c: FormGroup): string {
    const category = c.get('category')?.value;
    const categoryName = CATEGORIES_TRANSLATIONS[category?.code]
      ? this.translate.instant(CATEGORIES_TRANSLATIONS[category?.code])
      : category?.name || '';

    const options = c
      .get('options')
      ?.value?.map(o =>
        OPTIONS_TRANSLATIONS[o?.option?.code]
          ? this.translate.instant(OPTIONS_TRANSLATIONS[o.option.code])
          : o?.option?.name || ''
      )
      .join(', ');

    return `${categoryName} | ${options}`;
  }

  addOption(i: number): void {
    this.compound[i] = true;
    this.getOptionsFormArray(i).push(
      new UntypedFormGroup({
        option: new UntypedFormControl('', Validators.required),
        percentage: new UntypedFormControl(0, Validators.required)
      })
    );
  }

  removeOption(i: number, j: number): void {
    this.getOptionsFormArray(i).removeAt(j);

    if (this.getOptionsFormArray(i).length === 1) {
      this.compound[i] = false;
      this.getOptionsFormArray(i)
        .controls[0].get('percentage')
        .setValue(100);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const fv = this.form.getRawValue();
    const { type, asset, assetValue, assetName, assetPrice, assetCurrency } = fv;

    const assetObj =
      typeof asset === 'string' ? { code: asset, ...(this.id !== 'new' ? { _id: this.id } : {}) } : asset;

    const assetCategoryMap: AssetCategoryMap = this.categoriesCtrl.value.reduce(
      (acc: CategoryMap, { category, options }) => {
        const am = {};

        options.forEach(o => {
          am[o.option.code] = Number(o.percentage);
        });
        acc[category._id] = am;
        return acc;
      },
      {}
    );
    const parentId = this.route.snapshot.params.id;

    this.store.dispatch(
      actionUpdateAsset({
        asset: {
          ...assetObj,
          price: +assetPrice,
          currency: assetCurrency.code,
          value: +assetValue,
          parentId,
          type,
          name: assetName
        }
      })
    );
    this.store.dispatch(
      actionUpdateCategoryMap({
        code: assetObj.code,
        assetCategoryMap
      })
    );
  }

  private addCategories(
    asset: Asset,
    categoryMap: CategoryMap,
    categories: Category[],
    guessedCategories: Record<string, string>
  ): void {
    const assetCategoryMap = guessedCategories
      ? this.addGuessCategories(categoryMap[asset.code] || {}, categories, guessedCategories)
      : categoryMap[asset.code] || {};

    Object.keys(assetCategoryMap).forEach((catId, i) => {
      const category = categories.find(c => c._id === catId);

      const opts = Object.keys(assetCategoryMap[catId]).map(optionCode => ({
        option: category?.options.find(o => o.code === optionCode),
        percentage: assetCategoryMap[catId][optionCode]
      }));
      this.addCategory(category, opts);

      this.compound[i] = opts.length > 1;
    });
  }

  private addIfNotExists(extended: AssetCategoryMap, category: Category, option: Option): void {
    if (category && option) {
      if (!extended[category._id]) {
        extended[category._id] = {};
        extended[category._id][option.code] = 100;
      }
    }
  }

  private addGuessCategories(
    assetCategoryMap: AssetCategoryMap,
    categories: Category[],
    guessedCategories: Record<string, string>
  ): AssetCategoryMap {
    const extended = cloneDeep(assetCategoryMap);

    Object.keys(guessedCategories).forEach(catCode => {
      const category = categories.find(c => c.code === catCode);
      const option = category?.options.find(o => o.code === guessedCategories[catCode]);
      this.addIfNotExists(extended, category, option);
    });

    return extended || {};
  }

  private onTypeSelect(type: AssetType): void {
    this.assetCtrl.setValue('');

    if (type === AssetType.Custom) {
      this.assetPriceCtrl.enable();
      this.assetCurrencyCtrl.enable();
    } else {
      this.assetPriceCtrl.disable();
      this.assetCurrencyCtrl.disable();
    }

    this.form.updateValueAndValidity();
  }

  private filterAssets(value: string | Asset, list: Asset[]): Asset[] {
    if (typeof value !== 'string') {
      return list;
    }
    const filterValue = value.toLowerCase();

    return list.filter(
      item => item.code.toLowerCase().includes(filterValue) || item.name.toLowerCase().includes(filterValue)
    );
  }
}
