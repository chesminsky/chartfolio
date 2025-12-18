import { createSelector } from '@ngrx/store';

import { selectAssetsState } from '../core.state';
import { AssetsState } from './data.model';

export const selectAssets = createSelector(selectAssetsState, (state: AssetsState) => state.assets);
export const selectCurrencies = createSelector(selectAssetsState, (state: AssetsState) => state.currencies);
export const selectAssetsLoading = createSelector(selectAssetsState, (state: AssetsState) => state.loading);