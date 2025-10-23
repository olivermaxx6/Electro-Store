// Shared utilities and components
export const sharedUtils = {
  formatDate: (date) => new Date(date).toLocaleDateString(),
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
};

export default sharedUtils;
