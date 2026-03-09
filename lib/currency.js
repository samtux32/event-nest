const SUPPORTED_CURRENCIES = {
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
  INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
}

export function formatCurrency(amount, currencyCode = 'GBP') {
  const num = Number(amount) || 0
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.GBP
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

export function getCurrencySymbol(currencyCode = 'GBP') {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.GBP
  return currency.symbol
}

export function getSupportedCurrencies() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
    code,
    symbol: info.symbol,
    name: info.name,
  }))
}
