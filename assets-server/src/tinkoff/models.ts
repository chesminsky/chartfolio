// -- raw --

export interface Instrument {
  isin: string;
  figi: string;
  ticker: string;
  classCode: string;
  instrumentType: string;
  name: string;
  uid: string;
  positionUid: string;
  instrumentKind: string;
  apiTradeAvailableFlag: boolean;
  forIisFlag: boolean;
  first1minCandleDate: string;
  first1dayCandleDate: string;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  lot: number;
}

export interface TinkoffSearchResults {
  instruments: Instrument[];
}
