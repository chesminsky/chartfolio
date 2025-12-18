import { createAction, props } from '@ngrx/store';
import { Currency } from '../currency/currency.model';
import { Asset } from './data.model';

export enum AssetsActions {
  GetAssets = '[Assets] Get Assets',
  GetAssetsSuccess = '[Assets] Get Assets Success',
  GetAssetsError = '[Assets] Get Assets Error',

  UpdateAsset = '[Assets] Update Asset',
  UpdateAssetSuccess = '[Assets] Update Asset Success',
  UpdateAssetError = '[Assets] Update Asset Error',

  DeleteAsset = '[Assets] Delete Asset',
  DeleteAssetSuccess = '[Assets] Delete Asset Success',
  DeleteAssetError = '[Assets] Delete Asset Error',

  GetCurrencyList = '[Currency] Currency List',
  GetCurrencyListSuccess = '[Currency] Currency List Success',
  GetCurrencyListError = '[Currency] Currency List Error'
}

export const actionGetAssets = createAction(AssetsActions.GetAssets);
export const actionGetAssetsError = createAction(AssetsActions.GetAssetsError);
export const actionGetAssetsSuccess = createAction(AssetsActions.GetAssetsSuccess, props<{ assets: Asset[] }>());

export const actionUpdateAsset = createAction(
  AssetsActions.UpdateAsset,
  props<{ asset: Asset; parent?: Asset; notify?: boolean }>()
);
export const actionUpdateAssetError = createAction(AssetsActions.UpdateAssetError);
export const actionUpdateAssetSuccess = createAction(
  AssetsActions.UpdateAssetSuccess,
  props<{ asset: Asset; method: string; notify?: boolean }>()
);

export const actionDeleteAsset = createAction(
  AssetsActions.DeleteAsset,
  props<{ ids: string[]; navigateUrl?: string }>()
);
export const actionDeleteAssetError = createAction(AssetsActions.DeleteAssetError);
export const actionDeleteAssetSuccess = createAction(
  AssetsActions.DeleteAssetSuccess,
  props<{ ids: string[]; navigateUrl?: string }>()
);

export const actionGetCurrencyList = createAction(AssetsActions.GetCurrencyList);
export const actionGetCurrencyListError = createAction(AssetsActions.GetCurrencyListError);
export const actionGetCurrencyListSuccess = createAction(
  AssetsActions.GetCurrencyListSuccess,
  props<{ currencyList: Currency[] }>()
);
