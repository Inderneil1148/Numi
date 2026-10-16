export type TransactionType = 'expense' | 'income' | 'savings';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string;
  customTags: string[]; // Always empty array when type === 'savings'
  savingsGoalId?: string; // Associated savings target if type === 'savings'
  subscriptionId?: string; // Associated subscription if generated from recurring subscription
  isSubscription?: boolean; // Flag if this expense is a recurring subscription
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  name: string; // e.g. "Emergency Fund", "New Laptop", "Vacation"
  targetAmount: number;
  currentAmount: number; // Accumulated savings
  targetDate?: string; // Optional target completion date YYYY-MM-DD
  color?: string; // Hex color code or accent identifier
  note?: string;
  createdAt: number;
}

export interface Subscription {
  id: string;
  name: string; // e.g. "Netflix", "Spotify", "Gym Membership"
  amount: number; // Monthly recurring cost
  category: string; // Category e.g. "Entertainment", "Utilities"
  billingDay: number; // Day of the month: 1 - 31
  status: 'active' | 'paused';
  lastLoggedDate?: string; // YYYY-MM-DD to avoid duplicate reminder logs in the same cycle
  reminderDismissedMonth?: string; // YYYY-MM to track dismissed reminders for the month
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

export type ActiveTab = 'ledger' | 'tags' | 'subscriptions' | 'analytics' | 'settings';

export type ThemeMode = 'system' | 'light' | 'dark';
