export interface Rate {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

export interface Rate {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

export interface Currency {
  code: string;
  name: string;
}

// ----------

export interface CurrencyApiLatest {
  meta: {
    last_updated_at: Date;
  };
  data: {
    [key: string]: {
      code: string;
      value: number;
    };
  };
}

export interface CurrencyApiList {
  data: {
    [key: string]: {
      symbol: string;
      name: string;
      symbol_native: string;
      decimal_digits: number;
      rounding: number;
      code: string;
      name_plural: string;
    };
  };
}
