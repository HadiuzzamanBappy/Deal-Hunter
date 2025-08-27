// Currency conversion utilities
export const CURRENCY_RATES = {
  // Base rates to USD (these should be updated regularly in a real app)
  USD: 1,
  BDT: 119.50, // Bangladesh Taka
  CAD: 1.36,   // Canadian Dollar
  EUR: 0.92,   // Euro (for Germany)
  GBP: 0.79,   // British Pound
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  BDT: '৳',
  CAD: 'C$',
  EUR: '€',
  GBP: '£',
};

export const COUNTRY_CURRENCY_MAP = {
  US: 'USD',
  BD: 'BDT',
  CA: 'CAD',
  DE: 'EUR',
  UK: 'GBP',
};

export const convertCurrency = (priceString, fromCurrency = 'USD', toCurrency = 'USD') => {
  if (!priceString || fromCurrency === toCurrency) {
    return priceString;
  }

  // Extract numeric value from price string
  const numericMatch = priceString.match(/[\d,]+\.?\d*/);
  if (!numericMatch) {
    return priceString;
  }

  const numericValue = parseFloat(numericMatch[0].replace(/,/g, ''));
  
  // Convert to USD first, then to target currency
  const usdValue = numericValue / (CURRENCY_RATES[fromCurrency] || 1);
  const convertedValue = usdValue * (CURRENCY_RATES[toCurrency] || 1);

  // Format the converted value
  const symbol = CURRENCY_SYMBOLS[toCurrency] || toCurrency;
  
  if (toCurrency === 'BDT') {
    // Format Bangladeshi Taka without decimals
    return `${symbol} ${Math.round(convertedValue).toLocaleString()}`;
  } else {
    // Format other currencies with 2 decimal places
    return `${symbol}${convertedValue.toFixed(2)}`;
  }
};

export const getCountryCurrency = (countryCode) => {
  return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
};

export const convertPriceForCountry = (priceString, originalCurrency = 'USD', countryCode = 'US') => {
  const targetCurrency = getCountryCurrency(countryCode);
  return convertCurrency(priceString, originalCurrency, targetCurrency);
};

// Detect currency from price string
export const detectCurrencyFromPrice = (priceString) => {
  if (!priceString) return 'USD';
  
  if (priceString.includes('৳') || priceString.includes('BDT')) return 'BDT';
  if (priceString.includes('$') && priceString.includes('C')) return 'CAD';
  if (priceString.includes('£')) return 'GBP';
  if (priceString.includes('€')) return 'EUR';
  if (priceString.includes('$')) return 'USD';
  
  return 'USD'; // Default
};
