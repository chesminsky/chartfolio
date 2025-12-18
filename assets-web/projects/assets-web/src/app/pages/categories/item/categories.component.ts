import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { uniq } from 'lodash';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { actionDeleteCategory, actionUpdateCategory } from '../../../core/categories/categories.actions';
import { Category } from '../../../core/categories/categories.model';
import { selectCategories, selectCategoryLoading } from '../../../core/categories/categories.selectors';
import { CATEGORIES_TRANSLATIONS, OPTIONS_TRANSLATIONS } from '../translations';
import { TranslateService } from '@ngx-translate/core';

const validateOptionsSameName = () => (control: UntypedFormArray): ValidationErrors | null => {
  const arr = control.value.map(c => c.name);
  return arr.length === uniq(arr).length ? null : { optionsNotUnique: true };
};

@Component({
  selector: 'anms-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit {
  categories$ = this.store.select(selectCategories);
  form: UntypedFormGroup;
  initialModel: Category;
  editMode: boolean;
  id: string;
  readonly CATEGORIES_TRANSLATIONS = CATEGORIES_TRANSLATIONS;
  readonly OPTIONS_TRANSLATIONS = OPTIONS_TRANSLATIONS;

  loading$ = this.store.select(selectCategoryLoading);

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  get isDefaultCategory(): boolean {
    return this.editMode && this.initialModel.code === this.initialModel._id;
  }

  get options(): UntypedFormArray {
    return this.form?.get('options') as UntypedFormArray;
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.categories$])
      .pipe(
        map(([p, categories]) => {
          if (!p.id) {
            return {
              name: '',
              options: []
            };
          }
          this.id = p.id;
          return categories.find(c => c._id === p.id);
        })
      )
      .subscribe((category: Category) => {
        this.initialModel = category;
        if (this.initialModel) {
          this.editMode = Boolean(this.initialModel._id);
          this.form = new UntypedFormGroup({
            name: new UntypedFormControl(
              {
                value: this.isDefaultCategory
                  ? this.translateService.instant(CATEGORIES_TRANSLATIONS[category.code])
                  : category.name,
                disabled: this.isDefaultCategory
              },
              Validators.required
            ),
            options: new UntypedFormArray(
              category.options.map(
                o =>
                  new UntypedFormGroup({
                    name: new UntypedFormControl(
                      {
                        value: this.isDefaultCategory
                          ? this.translateService.instant(OPTIONS_TRANSLATIONS[o.code])
                          : o.name,
                        disabled: this.isDefaultCategory
                      },
                      Validators.required
                    ),
                    code: new UntypedFormControl(o.code)
                  })
              ),
              validateOptionsSameName()
            )
          });
        }
      });
  }

  deleteOption(i: number): void {
    this.options.removeAt(i);
  }

  back(): void {
    this.router.navigate(['/categories']);
  }

  delete() {
    this.store.dispatch(actionDeleteCategory({ id: this.id, navigationUrl: '/categories' }));
  }

  addOption(): void {
    this.options.push(
      new UntypedFormGroup({
        name: new UntypedFormControl('', Validators.required)
      })
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const category: Category = { ...this.initialModel, ...this.form.value };
    this.store.dispatch(actionUpdateCategory({ category }));
  }
}
