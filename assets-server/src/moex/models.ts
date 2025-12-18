// -- raw --

export interface MoexSearchResults {
  securities: {
    metadata: any;
    columns: string[];
    data: any[][];
  };
}

export interface MoexDividendsResults {
  dividends: {
    metadata: any;
    columns: string[];
    data: any[][];
  };
}

export interface DividendInfo {
  code: string;
  date: Date;
  year: string;
  value: number;
  currency: string;
}

// ---

export type MoexCouponsResults = [
  {
    charsetinfo: Charsetinfo;
  },
  {
    coupons?: Coupon[];
  }
];

export interface Coupon {
  isin: string;
  name: string;
  issuevalue: number;
  coupondate: string;
  recorddate: string;
  startdate: string;
  initialfacevalue: number;
  facevalue: number;
  faceunit: string;
  value: number;
  valueprc: number;
  value_rub: number;
  secid: string;
  primary_boardid: string;
}

export interface Charsetinfo {
  name: string;
}
