import { createAction, props } from '@ngrx/store';
import { AssetCategoryMap, Category, CategoryMap } from './categories.model';

export enum CategoriesActions {
  GetCategories = '[Categories] Get Categories',
  GetCategoriesSuccess = '[Categories] Get Categories Success',
  GetCategoriesError = '[Categories] Get Categories Error',

  GetCategoriesMap = '[Categories] Get CategoriesMap',
  GetCategoriesMapSuccess = '[Categories] Get CategoriesMap Success',
  GetCategoriesMapError = '[Categories] Get CategoriesMap Error',

  UpdateCategory = '[Categories] Update Category',
  UpdateCategorySuccess = '[Categories] Update Category Success',
  UpdateCategoryError = '[Categories] Update Category Error',

  DeleteCategory = '[Categories] Delete Category',
  DeleteCategorySuccess = '[Categories] Delete Category Success',
  DeleteCategoryError = '[Categories] Delete Category Error',

  UpdateCategoryMap = '[Categories] Update CategoryMap',
  UpdateCategoryMapSuccess = '[Categories] Update CategoryMap Success',
  UpdateCategoryMapError = '[Categories] Update CategoryMap Error',

  ValidateCategoryMap = '[Categories] Validate CategoryMap'
}

export const actionGetCategories = createAction(CategoriesActions.GetCategories);
export const actionGetCategoriesError = createAction(CategoriesActions.GetCategoriesError);
export const actionGetCategoriesSuccess = createAction(
  CategoriesActions.GetCategoriesSuccess,
  props<{ categories: Category[] }>()
);

export const actionGetCategoriesMap = createAction(CategoriesActions.GetCategoriesMap);
export const actionGetCategoriesMapError = createAction(CategoriesActions.GetCategoriesMapError);
export const actionGetCategoriesMapSuccess = createAction(
  CategoriesActions.GetCategoriesMapSuccess,
  props<{ categoryMap: CategoryMap }>()
);

export const actionUpdateCategory = createAction(CategoriesActions.UpdateCategory, props<{ category: Category }>());
export const actionUpdateCategoryError = createAction(CategoriesActions.UpdateCategoryError);
export const actionUpdateCategorySuccess = createAction(
  CategoriesActions.UpdateCategorySuccess,
  props<{ category: Category; method: string }>()
);

export const actionDeleteCategory = createAction(
  CategoriesActions.DeleteCategory,
  props<{ id: string; navigationUrl?: string }>()
);
export const actionDeleteCategoryError = createAction(CategoriesActions.DeleteCategoryError);
export const actionDeleteCategorySuccess = createAction(
  CategoriesActions.DeleteCategorySuccess,
  props<{ id: string; navigationUrl?: string }>()
);

export const actionUpdateCategoryMap = createAction(
  CategoriesActions.UpdateCategoryMap,
  props<{ code?: string; assetCategoryMap?: AssetCategoryMap; categoryMap?: CategoryMap }>()
);
export const actionUpdateCategoryMapError = createAction(CategoriesActions.UpdateCategoryMapError);
export const actionUpdateCategoryMapSuccess = createAction(
  CategoriesActions.UpdateCategoryMapSuccess,
  props<{ categoryMap: CategoryMap }>()
);

export const actionValidateCategoryMap = createAction(CategoriesActions.ValidateCategoryMap);
