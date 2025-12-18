export const defaultCategories = [
  {
    _id: 'ASSET_TYPE',
    options: [
      { name: 'Cash', code: 'CASH' },
      { name: 'Crypto', code: 'CRYPTO' },
      { name: 'Stocks', code: 'STOCKS' },
      { name: 'Bonds', code: 'BONDS' },
      { name: 'Commodities', code: 'COMMODITIES' },
      { name: 'Real estate', code: 'REAL_ESTATE' },
      { name: 'REIT', code: 'REIT' }
    ],
    name: 'Asset type',
    code: 'ASSET_TYPE'
  },
  {
    _id: 'MARKETS',
    options: [
      { name: 'US Market', code: 'USA' },
      { name: 'Developed countries (outside US)', code: 'DEVELOPED' },
      { name: 'Emerging markets', code: 'EMERGING' },
      { name: 'Russia', code: 'RUSSIA' }
    ],
    name: 'Markets',
    code: 'MARKETS'
  },
  {
    _id: 'RISK_PROFILE',
    options: [
      { name: 'Conservative', code: 'CONSERVATIVE' },
      { name: 'Moderate', code: 'MODERATE' },
      { name: 'Aggressive', code: 'AGGRESSIVE' }
    ],
    name: 'Risk Profile',
    code: 'RISK_PROFILE'
  },
  {
    _id: 'SECTOR_INDUSTRY',
    options: [
      { name: 'Energy', code: 'ENERGY' }, // Нефть и газ
      { name: 'Materials', code: 'MATERIALS' }, // Сырьевой сектор
      { name: 'Industrials', code: 'INDUSTRIALS' }, // Промышленность
      { name: 'Consumer Staples', code: 'CONSUMER_STAPLES' }, // Товары первой необходимости
      { name: 'Consumer Discretionary', code: 'CONSUMER_DISCRETIONARY' }, // Товары второй необходимости
      { name: 'Healthcare', code: 'HEALTHCARE' }, // Здравоохранение
      { name: 'Financial Services', code: 'FINANCIAL_SERVICES' }, // Финансы
      { name: 'Information Technology', code: 'INFORMATION_TECHNOLOGY' }, // Информационные технологии
      { name: 'Communication Services', code: 'COMMUNICATION_SERVICES' }, // Коммуникационные услуги
      { name: 'Utilities', code: 'UTILITIES' }, // Коммунальные услуги
      { name: 'Real Estate', code: 'REAL_ESTATE' }, // Недвижимость
    ],
    name: 'Sector or Industry',
    code: 'SECTOR_INDUSTRY'
  },
  {
    _id: 'LIQUIDITY',
    options: [
      { name: 'Liquid Assets', code: 'LIQUID_ASSETS' },
      { name: 'Semi-Liquid Assets', code: 'SEMI_LIQUID_ASSETS' },
      { name: 'Illiquid Assets', code: 'ILLIQUID_ASSETS' }
    ],
    name: 'Liquidity',
    code: 'LIQUIDITY'
  },
  {
    _id: 'INCOME_GENERATION',
    options: [
      { name: 'Dividend-Paying Stocks', code: 'DIVIDEND_PAYING_STOCKS' },
      { name: 'Interest-Paying Bonds', code: 'INTEREST_PAYING_BONDS' },
      { name: 'Rental Properties', code: 'RENTAL_PROPERTIES' },
      { name: 'Annuities', code: 'ANNUITIES' }
    ],
    name: 'Income Generation',
    code: 'INCOME_GENERATION'
  },
  {
    _id: 'PURPOSE_OR_GOAL',
    options: [
      { name: 'Retirement Savings', code: 'RETIREMENT_SAVINGS' },
      { name: 'Emergency Fund', code: 'EMERGENCY_FUND' },
      { name: 'Short-Term Goals', code: 'SHORT_TERM_GOALS' },
      { name: 'Long-Term Growth', code: 'LONG_TERM_GROWTH' }
    ],
    name: 'Purpose or Goal',
    code: 'PURPOSE_OR_GOAL'
  }
];
