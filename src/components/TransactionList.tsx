import React, { useMemo } from 'react';
import {
  Transaction,
  Category,
  CustomTag,
  CurrencyConfig,
  TimeFilter,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { TagChip } from './TagChip';
import { formatCurrency, formatDateLabel } from '../utils/formatters';
import { Search, X, Plus, ChevronRight } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  tags: CustomTag[];
  currency: CurrencyConfig;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  typeFilter: 'all' | 'expense' | 'income';
  onTypeFilterChange: (type: 'all' | 'expense' | 'income') => void;
  onEditTransaction: (tx: Transaction) => void;
  onAddNew: () => void;
  timeFilter?: TimeFilter;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  tags,
  currency,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  typeFilter,
  onTypeFilterChange,
  onEditTransaction,
  onAddNew,
  timeFilter = 'this-month',
}) => {
  const { tap } = useHaptics();

  const handleTypeClick = (type: 'all' | 'expense' | 'income') => {
    tap('light');
    onTypeFilterChange(type);
  };

  const handleTxClick = (tx: Transaction) => {
    tap('light');
    onEditTransaction(tx);
  };

  const handleAddClick = () => {
    tap('medium');
    onAddNew();
  };
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.name, c));
    return map;
  }, [categories]);

  const tagMap = useMemo(() => {
    const map = new Map<string, CustomTag>();
    tags.forEach((t) => map.set(t.name, t));
    return map;
  }, [tags]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      if (selectedTag && (!tx.customTags || !tx.customTags.includes(selectedTag))) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesNote = tx.note?.toLowerCase().includes(q) || false;
        const matchesTag = tx.customTags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesCategory && !matchesNote && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, typeFilter, selectedTag, searchQuery]);

  const groupedByDate = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    const groups: { date: string; items: Transaction[]; netTotal: number }[] = [];
    let currentGroup: { date: string; items: Transaction[]; netTotal: number } | null = null;

    sorted.forEach((tx) => {
      if (!currentGroup || currentGroup.date !== tx.date) {
        currentGroup = {
          date: tx.date,
          items: [],
          netTotal: 0,
        };
        groups.push(currentGroup);
      }
      currentGroup.items.push(tx);
      if (tx.type === 'income') {
        currentGroup.netTotal += tx.amount;
      } else {
        currentGroup.netTotal -= tx.amount;
      }
    });

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-4">
      {/* Material Design 3 Search Bar & Filter Chips */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={2.2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search title, note, category or #tag..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white text-[#1F1F1F] rounded-xl border border-[#C4C7C5] placeholder:text-[#747775] font-normal focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-all min-h-[38px] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#747775] text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Clear search"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Material 3 Segmented Pill Control */}
          <div className="flex p-1 bg-[#E0E2EC]/70 rounded-full sm:w-72 shrink-0">
            <button
              type="button"
              onClick={() => handleTypeClick('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[30px] cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-[#041E49] shadow-xs font-bold'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleTypeClick('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[30px] cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-[#B3261E] shadow-xs font-bold'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => handleTypeClick('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[30px] cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-[#146C2E] shadow-xs font-bold'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#D3E3FD] text-[#041E49] rounded-xl text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="opacity-80">Filter:</span>
              <span className="font-bold">#{selectedTag}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="text-[#0B57D0] hover:opacity-70 flex items-center gap-0.5 font-bold text-[11px] cursor-pointer"
            >
              <X size={12} strokeWidth={2.5} />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Feed Status Summary */}
      <div className="flex items-center justify-between px-2 text-[11px] text-[#444746] font-medium tracking-tight">
        <span>
          {timeFilter === 'this-month'
            ? 'This Month'
            : timeFilter === 'last-30-days'
            ? 'Last 30 Days'
            : 'All Time'}{' '}
          • {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'}
        </span>
        {filteredTransactions.length > 0 && (
          <span className="text-[10px] uppercase tracking-wider text-[#747775]">
            Grouped by date
          </span>
        )}
      </div>

      {/* Material Design 3 Grouped Inset Feed */}
      {groupedByDate.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E0E2EC] shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F4F9] flex items-center justify-center text-[#747775]">
            <Search size={22} strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#1F1F1F]">
              No Transactions Found
            </h3>
            <p className="text-xs text-[#444746] max-w-xs mx-auto">
              {searchQuery || selectedTag || typeFilter !== 'all'
                ? 'Try resetting your search query or tag filter.'
                : 'No transactions logged yet. Tap the button below to get started.'}
            </p>
          </div>
          {searchQuery || selectedTag || typeFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectTag(null);
                onTypeFilterChange('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-[#0B57D0] bg-[#D3E3FD] rounded-full hover:bg-[#D3E3FD]/80 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B57D0] rounded-full hover:bg-[#1A73E8] transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-1.5">
              {/* Material Design 3 Section Header */}
              <div className="flex items-center justify-between px-3 text-[12px] font-semibold text-[#444746] tracking-tight uppercase">
                <span>{formatDateLabel(group.date)}</span>
                <span className="tabular-nums font-medium text-[11px] normal-case">
                  {group.netTotal < 0 ? (
                    <span className="text-[#444746]">
                      -{formatCurrency(Math.abs(group.netTotal), currency, { signDisplay: 'never' })}
                    </span>
                  ) : group.netTotal > 0 ? (
                    <span className="text-[#146C2E] font-semibold">
                      +{formatCurrency(group.netTotal, currency, { signDisplay: 'never' })}
                    </span>
                  ) : (
                    formatCurrency(0, currency)
                  )}
                </span>
              </div>

              {/* Inset Grouped Table Cell List */}
              <div className="bg-white rounded-2xl border border-[#E0E2EC] shadow-xs divide-y divide-[#E0E2EC] overflow-hidden">
                {group.items.map((tx) => {
                  const cat = categoryMap.get(tx.category);
                  const isExpense = tx.type === 'expense';
                  const catColor = cat?.color || '#0B57D0';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleTxClick(tx)}
                      className="group flex items-center gap-3 px-3.5 py-3 hover:bg-[#F0F4F9] active:bg-[#E0E2EC]/70 transition-colors cursor-pointer min-h-[58px]"
                    >
                      {/* Squircle Glyph Badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${catColor}18`,
                          color: catColor,
                        }}
                      >
                        <CategoryIcon
                          iconName={cat?.iconName || 'CreditCard'}
                          size={18}
                          className=""
                        />
                      </div>

                      {/* Middle: Title, Category & Custom Tags */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#1F1F1F] truncate tracking-tight">
                            {tx.title}
                          </p>
                          {tx.note && (
                            <span
                              className="hidden md:inline-block text-xs text-[#747775] truncate max-w-[200px] lg:max-w-[280px]"
                              title={tx.note}
                            >
                              · {tx.note}
                            </span>
                          )}
                        </div>

                        {/* Category & Tags Row */}
                        <div className="flex items-center gap-1.5 text-xs text-[#444746] mt-0.5 min-w-0 overflow-hidden">
                          <span className="truncate max-w-[85px] sm:max-w-[120px] text-[11px] font-medium text-[#444746] shrink-0">
                            {tx.category}
                          </span>

                          {tx.customTags && tx.customTags.length > 0 && (
                            <>
                              <span className="text-[#C4C7C5] text-[10px] shrink-0" aria-hidden="true">
                                ·
                              </span>
                              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                {tx.customTags.slice(0, 2).map((tagName) => {
                                  const tagObj = tagMap.get(tagName);
                                  return (
                                    <TagChip
                                      key={tagName}
                                      name={tagName}
                                      color={tagObj?.color}
                                      size="sm"
                                      onClick={() => onSelectTag(selectedTag === tagName ? null : tagName)}
                                    />
                                  );
                                })}
                                {tx.customTags.length > 2 && (
                                  <span
                                    className="text-[10px] font-bold text-[#444746] bg-[#E0E2EC] px-1.5 py-0.5 rounded-full shrink-0"
                                    title={tx.customTags.slice(2).map((t) => `#${t}`).join(', ')}
                                  >
                                    +{tx.customTags.length - 2}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Chevron */}
                      <div className="text-right shrink-0 flex items-center gap-1.5 pl-1">
                        <div>
                          <div
                            className={`text-sm font-semibold tabular-nums tracking-tight whitespace-nowrap ${
                              isExpense ? 'text-[#1F1F1F]' : 'text-[#146C2E]'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(tx.amount, currency, { signDisplay: 'never' })}
                          </div>
                          {tx.time && (
                            <div className="text-[10px] text-[#747775] tabular-nums mt-0.5">
                              {tx.time}
                            </div>
                          )}
                        </div>
                        <ChevronRight size={14} className="text-[#C4C7C5] shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
