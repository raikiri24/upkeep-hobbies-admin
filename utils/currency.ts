/**
 * Philippine Peso Currency Utility
 * Centralized currency formatting for the application
 */

// Philippine Peso currency formatter
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Simplified peso symbol for display
export const formatCurrencySimple = (amount: number): string => {
  return `₱${amount.toFixed(2)}`;
};

// Get currency symbol
export const getCurrencySymbol = (): string => {
  return '₱';
};

// Format for CSV exports (plain text without symbol)
export const formatCurrencyForExport = (amount: number): string => {
  return amount.toFixed(2);
};

// Payment method icons with Philippine context
export const getPaymentMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash': 
      return { icon: '₱', color: 'text-green-400' };
    case 'card': 
      return { icon: '💳', color: 'text-blue-400' };
    case 'digital': 
      return { icon: '📱', color: 'text-purple-400' };
    case 'gcash': 
      return { icon: '🟢', color: 'text-emerald-400' };
    case 'paymaya': 
      return { icon: '🔵', color: 'text-blue-500' };
    default: 
      return { icon: '💰', color: 'text-slate-400' };
  }
};