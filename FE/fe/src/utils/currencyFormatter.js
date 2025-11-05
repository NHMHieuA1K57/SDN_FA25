export const formatCurrencyVND = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
    return '0 ₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};