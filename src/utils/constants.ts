import { Category, CustomTag } from '../types/finance';

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
  { id: 'cat-salary', name: 'Salary & Income', iconName: 'DollarSign', color: '#30B0C7', type: 'income' }, // iOS Cyan
  { id: 'cat-freelance', name: 'Side Projects', iconName: 'Laptop', color: '#34C759', type: 'income' }, // iOS Green
  { id: 'cat-other', name: 'Miscellaneous', iconName: 'Folder', color: '#8E8E93', type: 'both' }, // iOS Gray
];

export const DEFAULT_TAGS: CustomTag[] = [
  { id: 'tag-travel', name: 'travel', color: '#00C7BE', createdAt: 1710000000000 },
  { id: 'tag-work', name: 'work', color: '#8E8E93', createdAt: 1710000001000 },
];

export const TAG_COLOR_PALETTE = [
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
