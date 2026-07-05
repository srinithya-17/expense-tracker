const CURRENCY_SYMBOLS = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$',
};

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  const value = Number(amount || 0);
  return `${symbol}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
