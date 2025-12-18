import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEmpty, times } from 'lodash';
import { of } from 'rxjs';
import { catchError, map, mapTo, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { selectCategoriesState } from '../core.state';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { NotificationService } from '../notifications/notification.service';
import { UserService } from '../user/user.service';
import {
  actionDeleteCategory,
  actionDeleteCategorySuccess,
  actionGetCategories,
  actionGetCategoriesMap,
  actionGetCategoriesMapSuccess,
  actionGetCategoriesSuccess,
  actionUpdateCategory,
  actionUpdateCategoryMap,
  actionUpdateCategoryMapSuccess,
  actionUpdateCategorySuccess,
  actionValidateCategoryMap,
  CategoriesActions
} from './categories.actions';
import { Category, CategoryMap } from './categories.model';
import { CATEGORIES_KEY, CategoryService } from './categories.service';

@Injectable()
export class CategoriesEffects {
  getCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetCategories),
      mergeMap(action =>
        this.cs.getCategories().pipe(
          map((data: Category[]) => ({
            type: CategoriesActions.GetCategoriesSuccess,
            categories: data
          })),
          catchError(() => of({ type: CategoriesActions.GetCategoriesError }))
        )
      )
    )
  );

  getCategoriesMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetCategoriesMap),
      mergeMap(action =>
        this.cs.getCategoryMap().pipe(
          map((data: CategoryMap) => ({
            type: CategoriesActions.GetCategoriesMapSuccess,
            categoryMap: data
          })),
          catchError(() => of({ type: CategoriesActions.GetCategoriesMapError }))
        )
      )
    )
  );

  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionDeleteCategory),
      mergeMap(action =>
        this.cs.deleteCategories(action.id).pipe(
          map((id: string) => ({
            type: CategoriesActions.DeleteCategorySuccess,
            id,
            navigationUrl: action.navigationUrl
          })),
          catchError(() => of({ type: CategoriesActions.DeleteCategoryError }))
        )
      )
    )
  );

  deleteCategorySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionDeleteCategorySuccess),
      tap(action => {
        this.ns.success(this.ts.instant('anms.notification.category-deleted'));

        if (action.navigationUrl) {
          this.router.navigate([action.navigationUrl]);
        }
      }),
      mapTo({
        type: CategoriesActions.ValidateCategoryMap
      })
    )
  );

  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionUpdateCategory),
      mergeMap(action => {
        const method = action.category._id ? 'updateCategory' : 'createCategory';

        return this.cs[method](action.category).pipe(
          map((category: Category) => ({
            type: CategoriesActions.UpdateCategorySuccess,
            category,
            method
          })),
          catchError(() => of({ type: CategoriesActions.UpdateCategoryError }))
        );
      })
    )
  );

  updateCategorySuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionUpdateCategorySuccess),
      tap(action => {
        if (action.method === 'createCategory') {
          this.ns.success(`${this.ts.instant('anms.notification.category-created')} ${action.category.name}`);
        }
        if (action.method === 'updateCategory') {
          this.ns.success(`${this.ts.instant('anms.notification.category-edited')} ${action.category.name}`);
        }

        this.router.navigate(['/categories']);
      }),
      mapTo({
        type: CategoriesActions.ValidateCategoryMap
      })
    )
  );

  updateCategoryMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionUpdateCategoryMap),
      mergeMap(action =>
        this.us
          .updateCategoryMap({
            code: action.code,
            assetCategoryMap: action.assetCategoryMap,
            categoryMap: action.categoryMap
          })
          .pipe(
            map(categoryMap => ({
              type: CategoriesActions.UpdateCategoryMapSuccess,
              categoryMap
            })),
            catchError(() => of({ type: CategoriesActions.UpdateCategoryMapError }))
          )
      )
    )
  );

  validateCategoryMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionValidateCategoryMap),
      withLatestFrom(this.store.select(selectCategoriesState)),
      map(([action, cState]) => {
        const { categories, categoryMap } = cState;

        const cIds = categories.map(c => c._id);
        const cmap = cloneDeep(categoryMap);

        const validate = () => {
          Object.keys(cmap).forEach(aKey => {
            if (isEmpty(cmap[aKey])) {
              delete cmap[aKey];
              console.log('delte aKey cause empty', aKey);
            } else {
              Object.keys(cmap[aKey]).forEach(cKey => {
                if (!cIds.includes(cKey)) {
                  delete cmap[aKey][cKey];
                  console.log('delte cKey cause no category', cKey);
                } else {
                  Object.keys(cmap[aKey][cKey]).forEach(oKey => {
                    const cat = categories.find(c => c._id === cKey);
                    const opts = (cat?.options || []).map(o => o.code);
                    if (!opts.includes(oKey)) {
                      delete cmap[aKey][cKey][oKey];
                      console.log('delte oKey cause no option', oKey);
                    }
                    if (!cmap[aKey][cKey][oKey]) {
                      delete cmap[aKey][cKey][oKey];
                      console.log('delte oKey cause empty', oKey);
                    }
                  });
                }

                if (isEmpty(cmap[aKey][cKey])) {
                  delete cmap[aKey][cKey];
                  console.log('delte cKey cause empty', cKey);
                }
              });
            }
          });
        };

        validate();

        console.log(cmap);

        return {
          type: CategoriesActions.UpdateCategoryMap,
          categoryMap: cmap
        };
      })
    )
  );

  persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          actionGetCategoriesSuccess,
          actionUpdateCategorySuccess,
          actionDeleteCategory,
          actionGetCategoriesMapSuccess,
          actionUpdateCategoryMapSuccess
        ),
        withLatestFrom(this.store.pipe(select(selectCategoriesState))),
        tap(([action, state]) => this.localStorageService.setItem(CATEGORIES_KEY, state))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private cs: CategoryService,
    private store: Store,
    private localStorageService: LocalStorageService,
    private ns: NotificationService,
    private router: Router,
    private ts: TranslateService,
    private us: UserService
  ) {}
}
