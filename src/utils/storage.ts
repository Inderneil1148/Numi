import { Transaction, CustomTag, CurrencyConfig, BudgetConfig } from '../types/finance';
import { DEFAULT_TAGS } from './constants';
import { SUPPORTED_CURRENCIES } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'numi_finance_transactions',
  TAGS: 'numi_finance_tags',
  CURRENCY: 'numi_finance_currency',
  BUDGET: 'numi_finance_budget',
  THEME: 'numi_finance_theme',
};

const LEGACY_STORAGE_KEYS = {
  TRANSACTIONS: 'aether_finance_transactions',
  TAGS: 'aether_finance_tags',
  CURRENCY: 'aether_finance_currency',
  BUDGET: 'aether_finance_budget',
  THEME: 'aether_finance_theme',
};

function getStoredItem(key: keyof typeof STORAGE_KEYS): string | null {
  return localStorage.getItem(STORAGE_KEYS[key]) ?? localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
}

// Generates dynamic dates relative to today
function getOffsetDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSeedTransactions(): Transaction[] {
  return [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 280.00,
      title: 'Artisan Espresso & Pastry',
      category: 'Food & Dining',
      customTags: ['coffee'],
      date: getOffsetDate(0),
      time: '08:42',
      note: 'Morning flat white & croissant',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 2450.00,
      title: 'Fresh Market Groceries',
      category: 'Groceries',
      customTags: ['groceries'],
      date: getOffsetDate(0),
      time: '12:15',
      note: 'Fresh produce, milk, vegetables & fruit',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 450.00,
      title: 'Metro Transit Smart Card',
      category: 'Transportation',
      customTags: ['commute'],
      date: getOffsetDate(1),
      time: '09:05',
      note: 'Metro card monthly refill',
      createdAt: Date.now() - 3600000 * 26,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 1850.00,
      title: 'Bistro Laurent Dinner',
      category: 'Food & Dining',
      customTags: ['dining-out'],
      date: getOffsetDate(1),
      time: '20:10',
      note: 'Dinner with Marcus',
      createdAt: Date.now() - 3600000 * 30,
    },
    {
      id: 'tx-5',
      type: 'income',
      amount: 125000.00,
      title: 'Monthly Salary Credit',
      category: 'Salary & Income',
      customTags: [],
      date: getOffsetDate(3),
      time: '06:00',
      note: 'Primary corporate net deposit',
      createdAt: Date.now() - 3600000 * 72,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 28000.00,
      title: 'Apartment Monthly Rent',
      category: 'Housing & Rent',
      customTags: [],
      date: getOffsetDate(4),
      time: '10:00',
      note: 'Residential lease transfer',
      createdAt: Date.now() - 3600000 * 96,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 1499.00,
      title: 'GitHub & Cloud Subscriptions',
      category: 'Work & Tech',
      customTags: ['subscription', 'tax-deductible', 'work'],
      date: getOffsetDate(5),
      time: '11:30',
      note: 'Developer tooling renewal',
      createdAt: Date.now() - 3600000 * 120,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 2500.00,
      title: 'Fitness & Bouldering Pass',
      category: 'Health & Wellness',
      customTags: ['fitness'],
      date: getOffsetDate(6),
      time: '14:00',
      note: 'Monthly climbing access pass',
      createdAt: Date.now() - 3600000 * 144,
    },
    {
      id: 'tx-9',
      type: 'income',
      amount: 35000.00,
      title: 'Design System Consulting',
      category: 'Side Projects',
      customTags: ['tax-deductible', 'work'],
      date: getOffsetDate(8),
      time: '16:45',
      note: 'Milestone 2 design audit',
      createdAt: Date.now() - 3600000 * 190,
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 720.00,
      title: 'Roastery Pour Over & Beans',
      category: 'Food & Dining',
      customTags: ['coffee', 'groceries'],
      date: getOffsetDate(10),
      time: '09:20',
      note: 'Single origin whole bean pack',
      createdAt: Date.now() - 3600000 * 240,
    },
    {
      id: 'tx-11',
      type: 'expense',
      amount: 1850.00,
      title: 'Electric & Fiber Broadband',
      category: 'Bills & Utilities',
      customTags: ['tax-deductible'],
      date: getOffsetDate(12),
      time: '15:10',
      note: 'Home broadband fiber utility',
      createdAt: Date.now() - 3600000 * 280,
    },
    {
      id: 'tx-12',
      type: 'expense',
      amount: 3800.00,
      title: 'Weekend Rail Tickets',
      category: 'Transportation',
      customTags: ['travel'],
      date: getOffsetDate(20),
      time: '17:30',
      note: 'Weekend trip booking',
      createdAt: Date.now() - 3600000 * 480,
    },
    {
      id: 'tx-13',
      type: 'expense',
      amount: 5200.00,
      title: 'Annual Tech Conference Pass',
      category: 'Work & Tech',
      customTags: ['work', 'tax-deductible'],
      date: getOffsetDate(27),
      time: '14:20',
      note: 'Design & Engineering summit pass',
      createdAt: Date.now() - 3600000 * 648,
    },
    {
      id: 'tx-14',
      type: 'expense',
      amount: 28000.00,
      title: 'Previous Month Rent Transfer',
      category: 'Housing & Rent',
      customTags: [],
      date: getOffsetDate(35),
      time: '10:00',
      note: 'Prior month rent payment',
      createdAt: Date.now() - 3600000 * 840,
    },
    {
      id: 'tx-15',
      type: 'income',
      amount: 125000.00,
      title: 'Previous Month Salary Deposit',
      category: 'Salary & Income',
      customTags: [],
      date: getOffsetDate(36),
      time: '06:00',
      note: 'Prior month direct salary',
      createdAt: Date.now() - 3600000 * 864,
    },
    {
      id: 'tx-16',
      type: 'expense',
      amount: 8500.00,
      title: 'Noise Cancelling Headphones',
      category: 'Shopping',
      customTags: ['work'],
      date: getOffsetDate(52),
      time: '18:15',
      note: 'Audio equipment purchase',
      createdAt: Date.now() - 3600000 * 1248,
    },
  ];
}

export function loadStoredTransactions(): Transaction[] {
  try {
    if (localStorage.getItem('numi_finance_cleared') === 'true') {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
      return [];
    }

    const raw = getStoredItem('TRANSACTIONS');
    if (!raw) {
      const seeded = generateSeedTransactions();
      saveTransactions(seeded);
      return seeded;
    }
    const parsed: Transaction[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    const today = getOffsetDate(0);
    // If stored transactions are from old seed with small dollar amounts or outdated seed dates, refresh seed data
    const hasCurrentDates = parsed.some(
      (t) => t.date === today || t.date === getOffsetDate(1)
    );
    if (parsed.some((t) => t.id === 'tx-1' && (t.amount < 50 || !hasCurrentDates))) {
      const updated = generateSeedTransactions();
      saveTransactions(updated);
      return updated;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return generateSeedTransactions();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    if (transactions.length === 0) {
      localStorage.setItem('numi_finance_cleared', 'true');
    } else {
      localStorage.removeItem('numi_finance_cleared');
    }
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function clearAllTransactionsAndData(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.removeItem(LEGACY_STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem('numi_finance_cleared', 'true');
  } catch (err) {
    console.error('Failed to clear all transactions and data:', err);
  }
}

export function loadStoredTags(): CustomTag[] {
  try {
    const raw = getStoredItem('TAGS');
    if (!raw) {
      saveStoredTags(DEFAULT_TAGS);
      return DEFAULT_TAGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom tags:', err);
    return DEFAULT_TAGS;
  }
}

export function saveStoredTags(tags: CustomTag[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save tags:', err);
  }
}

export function loadStoredCurrency(): CurrencyConfig {
  const inr = SUPPORTED_CURRENCIES.find((c) => c.code === 'INR') || {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    placement: 'prefix',
  };
  try {
    const raw = getStoredItem('CURRENCY');
    if (!raw) {
      saveStoredCurrency(inr);
      return inr;
    }
    const parsed = JSON.parse(raw);
    // User requested ₹ as currency: migrate any non-INR stored setting to INR
    if (!parsed || parsed.code !== 'INR') {
      saveStoredCurrency(inr);
      return inr;
    }
    return inr;
  } catch {
    saveStoredCurrency(inr);
    return inr;
  }
}

export function saveStoredCurrency(currency: CurrencyConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  } catch (err) {
    console.error('Failed to save currency:', err);
  }
}

export function loadStoredBudget(): BudgetConfig {
  try {
    const raw = getStoredItem('BUDGET');
    if (!raw) {
      return { monthlyLimit: 50000, categories: {} };
    }
    const parsed = JSON.parse(raw);
    if (parsed.monthlyLimit === 2500) {
      const updated = { monthlyLimit: 50000, categories: {} };
      saveStoredBudget(updated);
      return updated;
    }
    return parsed;
  } catch {
    return { monthlyLimit: 50000, categories: {} };
  }
}

export function saveStoredBudget(budget: BudgetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  } catch (err) {
    console.error('Failed to save budget:', err);
  }
}

export function exportToCSV(transactions: Transaction[], currencySymbol: string): void {
  const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Title', 'Category', 'Custom Tags', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.amount.toFixed(2),
    currencySymbol,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.customTags.join(', ')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `numi-transactions-${getOffsetDate(0)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
