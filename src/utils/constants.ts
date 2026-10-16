import { Category, CustomTag, SavingsGoal, Subscription } from '../types/finance';

// iOS System Color Palette (Apple Human Interface Guidelines)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', iconName: 'Utensils', color: '#FF9500', type: 'expense' }, // iOS Orange
  { id: 'cat-groceries', name: 'Groceries', iconName: 'ShoppingCart', color: '#34C759', type: 'expense' }, // iOS Green
  { id: 'cat-housing', name: 'Housing & Rent', iconName: 'Home', color: '#007AFF', type: 'expense' }, // iOS Blue
  { id: 'cat-transport', name: 'Transportation', iconName: 'Car', color: '#5856D6', type: 'expense' }, // iOS Purple
  { id: 'cat-shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#AF52DE', type: 'expense' }, // iOS Indigo/Violet
  { id: 'cat-entertainment', name: 'Entertainment', iconName: 'Film', color: '#FF2D55', type: 'expense' }, // iOS Pink
  { id: 'cat-health', name: 'Health & Wellness', iconName: 'Activity', color: '#FF3B30', type: 'expense' }, // iOS Red
  { id: 'cat-utilities', name: 'Bills & Utilities', iconName: 'Zap', color: '#FFCC00', type: 'expense' }, // iOS Yellow
  { id: 'cat-work', name: 'Work & Tech', iconName: 'Briefcase', color: '#00C7BE', type: 'expense' }, // iOS Teal
  { id: 'cat-savings', name: 'Savings & Goals', iconName: 'PiggyBank', color: '#9EE42A', type: 'both' }, // Numi Lime
  { id: 'cat-salary', name: 'Salary & Income', iconName: 'DollarSign', color: '#30B0C7', type: 'income' }, // iOS Cyan
  { id: 'cat-freelance', name: 'Side Projects', iconName: 'Laptop', color: '#34C759', type: 'income' }, // iOS Green
  { id: 'cat-other', name: 'Miscellaneous', iconName: 'Folder', color: '#8E8E93', type: 'both' }, // iOS Gray
];

export const DEFAULT_TAGS: CustomTag[] = [
  { id: 'tag-travel', name: 'travel', color: '#00C7BE', createdAt: 1710000000000 },
  { id: 'tag-work', name: 'work', color: '#8E8E93', createdAt: 1710000001000 },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 2400,
    targetDate: '2026-12-31',
    color: '#9EE42A',
    note: '6 months of essential living expenses',
    createdAt: 1710000000000,
  },
  {
    id: 'goal-vacation',
    name: 'Japan Vacation',
    targetAmount: 3000,
    currentAmount: 1150,
    targetDate: '2027-04-15',
    color: '#007AFF',
    note: 'Flights and accommodation fund',
    createdAt: 1710000001000,
  },
];

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-spotify',
    name: 'Spotify Premium',
    amount: 11.99,
    category: 'Entertainment',
    billingDay: 16, // Renews on 16th of each month (today!)
    status: 'active',
    note: 'Music streaming service',
    createdAt: 1710000000000,
  },
  {
    id: 'sub-netflix',
    name: 'Netflix Standard',
    amount: 15.49,
    category: 'Entertainment',
    billingDay: 22,
    status: 'active',
    note: '4K video streaming',
    createdAt: 1710000001000,
  },
  {
    id: 'sub-icloud',
    name: 'iCloud+ 2TB',
    amount: 9.99,
    category: 'Work & Tech',
    billingDay: 5,
    status: 'active',
    note: 'Cloud storage and backup',
    createdAt: 1710000002000,
  },
];

export const TAG_COLOR_PALETTE = [
  { label: 'Lime', hex: '#9EE42A' },
  { label: 'Blue', hex: '#007AFF' },
  { label: 'Green', hex: '#34C759' },
  { label: 'Indigo', hex: '#5856D6' },
  { label: 'Orange', hex: '#FF9500' },
  { label: 'Pink', hex: '#FF2D55' },
  { label: 'Purple', hex: '#AF52DE' },
  { label: 'Red', hex: '#FF3B30' },
  { label: 'Teal', hex: '#00C7BE' },
  { label: 'Gray', hex: '#8E8E93' },
];
