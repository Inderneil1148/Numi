import { Transaction, CustomTag, CurrencyConfig, BudgetConfig, ThemeMode } from '../types/finance';
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
  return [];
}

export function loadStoredTransactions(): Transaction[] {
  try {
    const raw = getStoredItem('TRANSACTIONS');
    if (!raw) {
      return [];
    }
    const parsed: Transaction[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    // If storage contains old sample/seed transactions, clear them so everything starts at 0
    const hasLegacySampleData = parsed.some(
      (t) =>
        t.id === 'tx-1' ||
        t.title === 'Artisan Espresso & Pastry' ||
        t.title === 'Fresh Market Groceries'
    );
    if (hasLegacySampleData) {
      saveTransactions([]);
      return [];
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return [];
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
    const migrationKey = 'numi_tags_two_defaults_v1';
    if (!raw) {
      saveStoredTags(DEFAULT_TAGS);
      localStorage.setItem(migrationKey, 'true');
      return DEFAULT_TAGS;
    }
    const parsed: CustomTag[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredTags(DEFAULT_TAGS);
      localStorage.setItem(migrationKey, 'true');
      return DEFAULT_TAGS;
    }

    // One-time migration: strip legacy default tags that were removed, retaining only #travel and #work and any custom tags added by the user
    if (localStorage.getItem(migrationKey) !== 'true') {
      const removedOldTagNames = new Set([
        'coffee',
        'dining-out',
        'groceries',
        'commute',
        'subscription',
        'tax-deductible',
        'fitness',
      ]);
      const remainingTags = parsed.filter((t) => !removedOldTagNames.has(t.name.toLowerCase()));
      const hasTravel = remainingTags.some((t) => t.name.toLowerCase() === 'travel');
      const hasWork = remainingTags.some((t) => t.name.toLowerCase() === 'work');
      const updatedTags: CustomTag[] = [...remainingTags];
      if (!hasTravel) {
        updatedTags.unshift({ id: 'tag-travel', name: 'travel', color: '#00C7BE', createdAt: 1710000000000 });
      }
      if (!hasWork) {
        updatedTags.push({ id: 'tag-work', name: 'work', color: '#8E8E93', createdAt: 1710000001000 });
      }
      saveStoredTags(updatedTags);
      localStorage.setItem(migrationKey, 'true');
      return updatedTags;
    }

    return parsed;
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

export function loadStoredTheme(): ThemeMode {
  try {
    const raw = getStoredItem('THEME');
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.error('Failed to save theme:', err);
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
