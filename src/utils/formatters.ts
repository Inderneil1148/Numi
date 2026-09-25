import { CurrencyConfig } from '../types/finance';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', placement: 'prefix' },
  { code: 'USD', symbol: '$', name: 'US Dollar', placement: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', placement: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', placement: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', placement: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', placement: 'prefix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', placement: 'prefix' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', placement: 'prefix' },
];

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig,
  options?: { hideDecimals?: boolean; signDisplay?: 'always' | 'auto' | 'never' }
): string {
  const isJpy = currency.code === 'JPY';
  const decimals = options?.hideDecimals || isJpy ? 0 : 2;
  const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';

  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign =
    amount < 0 || options?.signDisplay === 'always'
      ? amount > 0
        ? '+'
        : '-'
      : '';

  const formattedAmount =
    currency.placement === 'prefix'
      ? `${currency.symbol}${formattedNumber}`
      : `${formattedNumber} ${currency.symbol}`;

  if (sign && options?.signDisplay !== 'never') {
    return `${sign} ${formattedAmount}`;
  }
  return formattedAmount;
}

export function formatDateLabel(dateString: string): string {
  // dateString is YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (targetDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Mon, Sep 22" or "Sep 22, 2025" if different year
  const isThisYear = targetDate.getFullYear() === now.getFullYear();
  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(isThisYear ? {} : { year: 'numeric' }),
  });
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
