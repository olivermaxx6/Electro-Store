// Currency formatting utilities

// Default currency configuration
const DEFAULT_CURRENCY = {
  code: 'GBP',
  symbol: '£',
  name: 'British Pound'
};

// Currency options
export const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

// Format price with currency symbol
export const formatPrice = (price, currency = DEFAULT_CURRENCY) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  
  const symbol = currency.symbol || DEFAULT_CURRENCY.symbol;
  return `${symbol}${price.toFixed(2)}`;
};

// Format currency symbol only
export const formatCurrencySymbol = (currency = DEFAULT_CURRENCY) => {
  return currency.symbol || DEFAULT_CURRENCY.symbol;
};

// Format currency with full name
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  const symbol = currency.symbol || DEFAULT_CURRENCY.symbol;
  return `${symbol}${amount.toFixed(2)} ${currency.code}`;
};

// Format number with commas
export const formatNumber = (number) => {
  if (typeof number !== 'number') {
    number = parseFloat(number) || 0;
  }
  return number.toLocaleString();
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return `${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

export default {
  formatPrice,
  formatCurrencySymbol,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  currencyOptions,
  DEFAULT_CURRENCY
};
