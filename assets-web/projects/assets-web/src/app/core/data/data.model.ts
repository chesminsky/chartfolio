import { AppState } from '../core.state';
import { Currency } from '../currency/currency.model';
import { AssetType } from './data.enum';

export interface Asset {
  _id?: string;
  name?: string;
  parentId?: string;
  value?: number;
  children?: Asset[];
  code?: string;
  created?: Date;
  type?: AssetType;
  searchCode?: string;
  price?: number;
  currency?: string;
}

export interface GroupedAsset {
  value?: number;
  category?: string;
}

export interface AssetsState {
  assets: Asset[];
  currencies: Currency[];
  loading: boolean;
}

export interface State extends AppState {
  data: AssetsState;
}
