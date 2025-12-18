import { AppState } from '../core.state';

export interface Category {
  _id?: string;
  name: string;
  code: string;
  options?: Array<Option>;
}

export interface Option {
  name: string;
  code: string;
}

export interface AssetCategoryMap {
  [key: string]: { [key: string]: number }; // categoryId to map of options
}

export interface CategoryMap {
  [key: string]: AssetCategoryMap; // asset code to asset category map
}

export interface CategoriesState {
  categories: Category[];
  categoryMap: CategoryMap;
  loading: boolean;
}

export interface State extends AppState {
  categories: CategoriesState;
}

export enum Categories {
  AssetType = 'ASSET_TYPE',
  Markets = 'MARKETS'
}

export enum CategoryOptions {
  Cash = 'CASH',
  Crypto = 'CRYPTO',
  Stocks = 'STOCKS',
  Bonds = 'BONDS',
  Gold = 'GOLD',
  REIT = 'REIT',
  RealEstate = 'REAL_ESTATE',
  USA = 'USA',
  Developed = 'DEVELOPED',
  Emerging = 'EMERGING',
  Russia = 'RUSSIA'
}
