export interface Stock {
  symbol: string;
  name: string;
}

export interface StockInfo {
  price: number;
  currency: string;
  name: string;
  symbol: string;
}

export interface DividendInfo {
  code: string;
  date: string;
  year: string;
  value: number;
  currency: string;
}
