import React, { useState, useMemo } from 'react';
import {
  Transaction,
  CustomTag,
  CurrencyConfig,
  BudgetConfig,
  ActiveTab,
  TimeFilter,
} from './types/finance';
import {
  loadStoredTransactions,
  saveTransactions,
  loadStoredTags,
  saveStoredTags,
  loadStoredCurrency,
  saveStoredCurrency,
  loadStoredBudget,
  saveStoredBudget,
  clearAllTransactionsAndData,
} from './utils/storage';
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, TAG_COLOR_PALETTE } from './utils/constants';
import { useHaptics } from './hooks/useHaptics';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OverviewCard } from './components/OverviewCard';
import { TagFilterBar } from './components/TagFilterBar';
import { TransactionList } from './components/TransactionList';
import { TagAnalytics } from './components/TagAnalytics';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';
import { DownloadBanner } from './components/DownloadBanner';

export default function App() {
  const { tap, success, warning } = useHaptics();
  const { theme, setTheme } = useTheme();

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [tags, setTags] = useState<CustomTag[]>(loadStoredTags);
  const [currency, setCurrency] = useState<CurrencyConfig>(loadStoredCurrency);
  const [budget, setBudget] = useState<BudgetConfig>(loadStoredBudget);

  // Top Download Banner State
  const [showDownloadBanner, setShowDownloadBanner] = useState<boolean>(() => {
    return localStorage.getItem('numi_download_banner_hidden') !== 'true';
  });

  const handleToggleDownloadBanner = (show: boolean) => {
    setShowDownloadBanner(show);
    if (show) {
      localStorage.removeItem('numi_download_banner_hidden');
    } else {
      localStorage.setItem('numi_download_banner_hidden', 'true');
    }
  };

  // View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-month');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  const handleTabChange = (tab: ActiveTab) => {
    tap('light');
    setActiveTab(tab);
  };

  const handleTimeFilterChange = (tf: TimeFilter) => {
    tap('light');
    setTimeFilter(tf);
  };

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter transactions by timeFilter
  const timeFilteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthPrefix = `${currentYear}-${currentMonth}`;

    const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d30.setDate(d30.getDate() - 30);
    const y30 = d30.getFullYear();
    const m30 = String(d30.getMonth() + 1).padStart(2, '0');
    const day30 = String(d30.getDate()).padStart(2, '0');
    const thirtyDaysAgoStr = `${y30}-${m30}-${day30}`;

    return transactions.filter((tx) => {
      if (timeFilter === 'this-month') {
        return tx.date.startsWith(thisMonthPrefix);
      }
      if (timeFilter === 'last-30-days') {
        return tx.date >= thirtyDaysAgoStr;
      }
      return true; // all-time
    });
  }, [transactions, timeFilter]);

  // Aggregate period figures
  const { periodIncome, periodExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    timeFilteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
      } else {
        exp += tx.amount;
      }
    });
    return { periodIncome: inc, periodExpense: exp };
  }, [timeFilteredTransactions]);

  // Count transactions per tag for the filter bar
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    timeFilteredTransactions.forEach((tx) => {
      if (tx.customTags) {
        tx.customTags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }, [timeFilteredTransactions]);

  // Data Actions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    success();
    if (txData.id) {
      // Update
      const updated = transactions.map((t) =>
        t.id === txData.id
          ? {
              ...t,
              ...txData,
              id: txData.id,
              createdAt: t.createdAt,
            }
          : t
      );
      setTransactions(updated);
      saveTransactions(updated);
    } else {
      // Create new
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: txData.type,
        amount: txData.amount,
        title: txData.title,
        category: txData.category,
        customTags: txData.customTags || [],
        date: txData.date,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        note: txData.note,
        createdAt: Date.now(),
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    warning();
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleCreateTag = (name: string, color?: string): CustomTag => {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const existing = tags.find((t) => t.name === clean);
    if (existing) return existing;

    const newTag: CustomTag = {
      id: `tag-${Date.now()}`,
      name: clean,
      color: color || TAG_COLOR_PALETTE[Math.floor(Math.random() * TAG_COLOR_PALETTE.length)].hex,
      createdAt: Date.now(),
    };
    const updated = [...tags, newTag];
    setTags(updated);
    saveStoredTags(updated);
    return newTag;
  };

  const handleUpdateTag = (id: string, newName: string, newColor: string) => {
    const oldTag = tags.find((t) => t.id === id);
    if (!oldTag) return;

    const updatedTags = tags.map((t) =>
      t.id === id ? { ...t, name: newName, color: newColor } : t
    );
    setTags(updatedTags);
    saveStoredTags(updatedTags);

    if (oldTag.name !== newName) {
      const updatedTx = transactions.map((tx) => {
        if (tx.customTags && tx.customTags.includes(oldTag.name)) {
          return {
            ...tx,
            customTags: tx.customTags.map((tg) => (tg === oldTag.name ? newName : tg)),
          };
        }
        return tx;
      });
      setTransactions(updatedTx);
      saveTransactions(updatedTx);

      if (selectedTag === oldTag.name) {
        setSelectedTag(newName);
      }
    }
  };

  const handleDeleteTag = (id: string, tagName: string) => {
    const updatedTags = tags.filter((t) => t.id !== id);
    setTags(updatedTags);
    saveStoredTags(updatedTags);

    if (selectedTag === tagName) {
      setSelectedTag(null);
    }
  };

  const handleDeleteAllData = () => {
    warning();
    setTransactions([]);
    setSelectedTag(null);
    clearAllTransactionsAndData();
    setToastMessage('✓ All transactions erased. Everything reset to zero.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleImportData = (data: { transactions: Transaction[]; tags: CustomTag[] }) => {
    success();
    setTransactions(data.transactions);
    saveTransactions(data.transactions);
    if (data.tags && data.tags.length > 0) {
      setTags(data.tags);
      saveStoredTags(data.tags);
    }
  };

  const handleFilterByTag = (tagName: string) => {
    tap('light');
    setSelectedTag(tagName);
    setActiveTab('ledger');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors">
      {/* Top Download Smart Banner */}
      {showDownloadBanner && (
        <DownloadBanner
          onDismiss={() => handleToggleDownloadBanner(false)}
        />
      )}

      {/* Responsive layout container: seamless across mobile, tablet, and desktop */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Top Header with Responsive Time Filter, Desktop Navigation & Currency Badge */}
        <Header
          activeTab={activeTab}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          onOpenSettings={() => {
            tap('light');
            setIsSettingsOpen(true);
          }}
          currency={currency}
          onTabChange={handleTabChange}
          onOpenAddModal={() => {
            tap('medium');
            setEditingTx(null);
            setIsModalOpen(true);
          }}
        />

        {/* Main Tab Content (Responsive padding and spacing across all devices) */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-12">
          {activeTab === 'ledger' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column (Sticky Sidebar on Desktop): Overview & Tags Filter */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
                {/* Apple Card Style Overview Card */}
                <OverviewCard
                  income={periodIncome}
                  expense={periodExpense}
                  currency={currency}
                  monthlyBudget={budget.monthlyLimit}
                  onOpenAnalytics={() => setActiveTab('analytics')}
                  timeFilter={timeFilter}
                />

                {/* Apple Pill Horizontal Custom Tag Filter */}
                <TagFilterBar
                  tags={tags}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  onOpenTagManager={() => setActiveTab('tags')}
                  tagCounts={tagCounts}
                />
              </div>

              {/* Right Column: Inset Grouped Transaction Feed */}
              <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                <TransactionList
                  transactions={timeFilteredTransactions}
                  categories={DEFAULT_CATEGORIES}
                  tags={tags}
                  currency={currency}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  typeFilter={typeFilter}
                  onTypeFilterChange={setTypeFilter}
                  onEditTransaction={(tx) => {
                    setEditingTx(tx);
                    setIsModalOpen(true);
                  }}
                  onAddNew={() => {
                    setEditingTx(null);
                    setIsModalOpen(true);
                  }}
                  timeFilter={timeFilter}
                />
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <TagAnalytics
              transactions={timeFilteredTransactions}
              tags={tags}
              currency={currency}
              onCreateTag={handleCreateTag}
              onUpdateTag={handleUpdateTag}
              onDeleteTag={handleDeleteTag}
              onFilterByTag={handleFilterByTag}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={timeFilteredTransactions}
              categories={DEFAULT_CATEGORIES}
              currency={currency}
              budget={budget}
              onEditBudget={() => setIsSettingsOpen(true)}
            />
          )}
        </main>

        {/* Fixed Responsive Bottom Navigation Bar for Mobile Viewports */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddModal={() => {
            tap('medium');
            setEditingTx(null);
            setIsModalOpen(true);
          }}
        />

        {/* Transaction Add/Edit Sheet Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTx(null);
          }}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          editingTransaction={editingTx}
          categories={DEFAULT_CATEGORIES}
          availableTags={tags}
          onCreateTag={handleCreateTag}
          currency={currency}
        />

        {/* Settings & Preferences Sheet Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currency={currency}
          onUpdateCurrency={(c) => {
            setCurrency(c);
            saveStoredCurrency(c);
          }}
          budget={budget}
          onUpdateBudget={(b) => {
            setBudget(b);
            saveStoredBudget(b);
          }}
          transactions={transactions}
          tags={tags}
          onDeleteAllData={handleDeleteAllData}
          onImportData={handleImportData}
          showDownloadBanner={showDownloadBanner}
          onToggleDownloadBanner={handleToggleDownloadBanner}
          theme={theme}
          onUpdateTheme={setTheme}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#1D1D1F] dark:bg-[#2C2C2E] text-white text-xs font-semibold rounded-full shadow-xl border border-transparent dark:border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
