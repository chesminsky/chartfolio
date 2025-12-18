export interface Rate {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

export interface Currency {
  code: string;
  name: string;
}
