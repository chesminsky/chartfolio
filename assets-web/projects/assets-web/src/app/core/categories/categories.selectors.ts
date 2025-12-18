import { createSelector } from '@ngrx/store';
import { selectCategoriesState } from '../core.state';
import { CategoriesState } from './categories.model';

export const selectCategories = createSelector(selectCategoriesState, (state: CategoriesState) => state.categories);
export const selectCategoryMap = createSelector(selectCategoriesState, (state: CategoriesState) => state.categoryMap);
export const selectCategoryLoading = createSelector(selectCategoriesState, (state: CategoriesState) => state.loading);
