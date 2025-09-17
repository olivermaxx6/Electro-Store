import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Currency options with symbols
export const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
];

export const useCurrency = create(
  persist(
    (set, get) => ({
      // Current currency code
      currency: 'USD',
      
      // Get current currency object
      getCurrentCurrency: () => {
        const { currency } = get();
        return currencyOptions.find(curr => curr.code === currency) || currencyOptions[0];
      },
      
      // Set currency
      setCurrency: (currencyCode) => {
        set({ currency: currencyCode });
      },
      
      // Format amount with current currency
      formatAmount: (amount) => {
        const currentCurrency = get().getCurrentCurrency();
        const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
        return `${currentCurrency.symbol}${formattedAmount}`;
      },
      
      // Get currency symbol only
      getSymbol: () => {
        return get().getCurrentCurrency().symbol;
      },
      
      // Get currency name only
      getName: () => {
        return get().getCurrentCurrency().name;
      },
    }),
    {
      name: 'currency-storage', // localStorage key
    }
  )
);

