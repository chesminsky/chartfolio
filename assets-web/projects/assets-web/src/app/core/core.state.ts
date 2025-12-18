import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, createFeatureSelector, MetaReducer } from '@ngrx/store';

import { AuthState } from './auth/auth.models';
import { authReducer } from './auth/auth.reducer';
import { CategoriesState } from './categories/categories.model';
import { categoryReducer } from './categories/categories.reducer';
import { AssetsState } from './data/data.model';
import { dataReducer } from './data/data.reducer';
import { initStateFromLocalStorage } from './meta-reducers/init-state-from-local-storage.reducer';
import { RouterStateUrl } from './router/router.state';
import { SettingsState } from './settings/settings.model';
import { settingsReducer } from './settings/settings.reducer';
import { UserState } from './user/user.model';
import { userReducer } from './user/user.reducer';

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  settings: settingsReducer,
  router: routerReducer,
  data: dataReducer,
  categories: categoryReducer,
  user: userReducer
};

export const metaReducers: MetaReducer<AppState>[] = [initStateFromLocalStorage];
export const selectAssetsState = createFeatureSelector<AssetsState>('data');
export const selectCategoriesState = createFeatureSelector<CategoriesState>('categories');
export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectSettingsState = createFeatureSelector<SettingsState>('settings');
export const selectRouterState = createFeatureSelector<RouterReducerState<RouterStateUrl>>('router');
export const selectUserState = createFeatureSelector<UserState>('user');

export interface AppState {
  auth: AuthState;
  settings: SettingsState;
  router: RouterReducerState<RouterStateUrl>;
  data: AssetsState;
  categories: CategoriesState;
  user: UserState;
}
