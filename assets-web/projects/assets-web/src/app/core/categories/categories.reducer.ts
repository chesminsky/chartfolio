import { Action, createReducer, on } from '@ngrx/store';
import {
  actionDeleteCategory,
  actionGetCategoriesMapSuccess,
  actionGetCategoriesSuccess,
  actionUpdateCategoryMapSuccess,
  actionUpdateCategorySuccess,
  actionGetCategories,
  actionGetCategoriesMap,
  actionUpdateCategory,
  actionUpdateCategoryMap,
  actionDeleteCategorySuccess,
  actionGetCategoriesError,
  actionGetCategoriesMapError,
  actionUpdateCategoryError,
  actionDeleteCategoryError,
  actionUpdateCategoryMapError
} from './categories.actions';
import { CategoriesState } from './categories.model';

export const initialState: CategoriesState = {
  categories: null,
  categoryMap: null,
  loading: false
};

const reducer = createReducer(
  initialState,
  on(
    actionGetCategories,
    actionGetCategoriesMap,
    actionUpdateCategory,
    actionDeleteCategory,
    actionUpdateCategoryMap,
    state => ({ ...state, loading: true })
  ),
  on(
    actionDeleteCategorySuccess,
    actionGetCategoriesError,
    actionGetCategoriesMapError,
    actionUpdateCategoryError,
    actionDeleteCategoryError,
    actionUpdateCategoryMapError,
    state => ({ ...state, loading: false })
  ),
  on(actionGetCategoriesSuccess, (state, action) => ({
    ...state,
    categories: action.categories,
    loading: false
  })),
  on(actionGetCategoriesMapSuccess, (state, action) => ({
    ...state,
    categoryMap: action.categoryMap,
    loading: false
  })),
  on(actionDeleteCategory, (state, action) => {
    const filtered = state.categories.filter(a => a._id !== action.id);
    return {
      ...state,
      categories: filtered
    };
  }),
  on(actionUpdateCategorySuccess, (state, action) => {
    const index = state.categories.findIndex(a => a._id === action.category._id);
    const categories = [...state.categories];

    if (index >= 0) {
      categories[index] = action.category;
    } else {
      categories.push(action.category);
    }
    return {
      ...state,
      categories,
      loading: false
    };
  }),
  on(actionUpdateCategoryMapSuccess, (state, action) => ({
    ...state,
    categoryMap: action.categoryMap,
    loading: false
  }))
);

export function categoryReducer(state: CategoriesState | undefined, action: Action) {
  return reducer(state, action);
}
