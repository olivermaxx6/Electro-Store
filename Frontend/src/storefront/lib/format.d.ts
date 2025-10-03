export declare const currencyOptions: Array<{ code: string; symbol: string; name: string }>;
export declare function formatPrice(price: number | string, currency?: { code: string; symbol: string; name: string }): string;
export declare function formatCurrencySymbol(currency?: { code: string; symbol: string; name: string }): string;
export declare function formatCurrency(amount: number | string, currency?: { code: string; symbol: string; name: string }): string;
export declare function formatNumber(number: number | string): string;
export declare function formatPercentage(value: number | string, decimals?: number): string;
export declare function formatDate(date: string | Date): string;
export declare function formatDateTime(date: string | Date): string;
export declare function formatRelativeTime(date: string | Date): string;
declare const _default: {
  formatPrice: typeof formatPrice;
  formatCurrencySymbol: typeof formatCurrencySymbol;
  formatCurrency: typeof formatCurrency;
  formatNumber: typeof formatNumber;
  formatPercentage: typeof formatPercentage;
  formatDate: typeof formatDate;
  formatDateTime: typeof formatDateTime;
  formatRelativeTime: typeof formatRelativeTime;
  currencyOptions: typeof currencyOptions;
};
export default _default;

