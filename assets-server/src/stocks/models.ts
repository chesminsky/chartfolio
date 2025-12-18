export interface Stock {
  name: string;
  symbol: string;
  raw?: any;
}

export interface StockInfo {
  price: number;
  currency: string;
  name: string;
  symbol: string;
}

// -- raw --

export interface YahooFinanceQuote {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  index: string;
  score: number;
  typeDisp: string;
  exchDisp: string;
  isYahooFinance: boolean;
  longname: string;
}

export interface YahooFinanceList {
  slug: string;
  name: string;
  index: string;
  score: number;
  type: string;
  brandSlug: string;
  pfId: string;
  id: string;
  title: string;
  canonicalName: string;
  isPremium?: boolean;
}

export interface YahooFinanceSearch {
  explains: any[];
  count: number;
  quotes: YahooFinanceQuote[];
  news: any[];
  nav: any[];
  lists: YahooFinanceList[];
  researchReports: any[];
  screenerFieldResults: any[];
  totalTime: number;
  timeTakenForQuotes: number;
  timeTakenForNews: number;
  timeTakenForAlgowatchlist: number;
  timeTakenForPredefinedScreener: number;
  timeTakenForCrunchbase: number;
  timeTakenForNav: number;
  timeTakenForResearchReports: number;
  timeTakenForScreenerField: number;
}
