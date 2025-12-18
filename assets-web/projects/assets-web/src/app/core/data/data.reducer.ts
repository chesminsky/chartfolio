import { Action, createReducer, on } from '@ngrx/store';
import {
  actionDeleteAsset,
  actionGetAssetsSuccess,
  actionGetCurrencyListSuccess,
  actionUpdateAssetSuccess,
  actionGetAssets,
  actionUpdateAsset,
  actionGetAssetsError,
  actionUpdateAssetError,
  actionDeleteAssetError
} from './data.actions';
import { AssetsState } from './data.model';

export const initialState: AssetsState = {
  loading: false,
  assets: null,
  currencies: []
};

const reducer = createReducer(
  initialState,

  on(actionGetAssets, actionUpdateAsset, actionDeleteAsset, state => ({ ...state, loading: true })),
  on(actionGetAssetsError, actionUpdateAssetError, actionDeleteAssetError, state => ({ ...state, loading: false })),
  on(actionGetAssetsSuccess, (state, action) => ({
    ...state,
    assets: action.assets,
    loading: false
  })),
  on(actionGetCurrencyListSuccess, (state, action) => ({
    ...state,
    currencies: action.currencyList
  })),
  on(actionDeleteAsset, (state, action) => {
    const filtered = state.assets.filter(a => !action.ids.includes(a._id));

    return {
      ...state,
      assets: filtered,
      loading: false
    };
  }),
  on(actionUpdateAssetSuccess, (state, action) => {
    const index = state.assets.findIndex(a => a._id === action.asset._id);
    const assets = [...state.assets];

    if (index >= 0) {
      assets[index] = action.asset;
    } else {
      assets.push(action.asset);
    }
    return {
      ...state,
      assets,
      loading: false
    };
  })
);

export function dataReducer(state: AssetsState | undefined, action: Action) {
  return reducer(state, action);
}
