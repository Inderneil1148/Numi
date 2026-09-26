export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string;
  customTags: string[];
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  createdAt: number;
}

export interface CustomTag {
  id: string;
  name: string; // e.g. "coffee", "tax-deductible"
  color: string; // Hex or theme tone identifier
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType | 'both';
}

export interface BudgetConfig {
  monthlyLimit: number;
  categories: Record<string, number>;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  placement: 'prefix' | 'suffix';
}

export type TimeFilter = 'this-month' | 'last-month' | 'last-30-days' | 'all-time' | 'custom';

export type ActiveTab = 'ledger' | 'tags' | 'analytics' | 'settings';

export type ThemeMode = 'system' | 'light' | 'dark';
