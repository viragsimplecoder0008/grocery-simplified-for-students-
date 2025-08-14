import { Currency, CurrencyInfo } from '@/types/grocery';

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: 0.85, // Approximate rate
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    exchangeRate: 0.73, // Approximate rate
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    exchangeRate: 83.0, // Approximate rate
  },
};

export const formatPrice = (price: number, currency: Currency = 'USD'): string => {
  const currencyInfo = CURRENCIES[currency];
  const convertedPrice = price * currencyInfo.exchangeRate;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedPrice);
};

export const convertPrice = (price: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return price;
  
  // Convert to USD first, then to target currency
  const usdPrice = price / CURRENCIES[fromCurrency].exchangeRate;
  return usdPrice * CURRENCIES[toCurrency].exchangeRate;
};

export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCIES[currency].symbol;
};

export const getCurrencyName = (currency: Currency): string => {
  return CURRENCIES[currency].name;
};
