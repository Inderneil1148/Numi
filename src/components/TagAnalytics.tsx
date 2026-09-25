import React, { useState, useMemo } from 'react';
import {
  Transaction,
  CustomTag,
  CurrencyConfig,
} from '../types/finance';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { TAG_COLOR_PALETTE } from '../utils/constants';
import { Plus, Trash2, Edit2, Check, X, ChevronRight } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface TagAnalyticsProps {
  transactions: Transaction[];
  tags: CustomTag[];
  currency: CurrencyConfig;
  onCreateTag: (name: string, color?: string) => CustomTag;
  onUpdateTag: (id: string, name: string, color: string) => void;
  onDeleteTag: (id: string, tagName: string) => void;
  onFilterByTag: (tagName: string) => void;
}

export const TagAnalytics: React.FC<TagAnalyticsProps> = ({
  transactions,
  tags,
  currency,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onFilterByTag,
}) => {
  const { tap, selection, success, warning } = useHaptics();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PALETTE[0].hex);

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDeleteTagId, setConfirmDeleteTagId] = useState<string | null>(null);

  const { tagStats, totalExpenseSpend, untaggedTotal, untaggedCount } = useMemo(() => {
    let totalExpense = 0;
    let untaggedExpTotal = 0;
    let untaggedExpCount = 0;

    const statsMap: Record<
      string,
      { totalSpend: number; incomeTotal: number; count: number }
    > = {};

    tags.forEach((t) => {
      statsMap[t.name] = { totalSpend: 0, incomeTotal: 0, count: 0 };
    });

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalExpense += tx.amount;
        if (!tx.customTags || tx.customTags.length === 0) {
          untaggedExpTotal += tx.amount;
          untaggedExpCount += 1;
        } else {
          tx.customTags.forEach((tagName) => {
            if (!statsMap[tagName]) {
              statsMap[tagName] = { totalSpend: 0, incomeTotal: 0, count: 0 };
            }
            statsMap[tagName].totalSpend += tx.amount;
            statsMap[tagName].count += 1;
          });
        }
      } else if (tx.type === 'income') {
        if (tx.customTags && tx.customTags.length > 0) {
          tx.customTags.forEach((tagName) => {
            if (!statsMap[tagName]) {
              statsMap[tagName] = { totalSpend: 0, incomeTotal: 0, count: 0 };
            }
            statsMap[tagName].incomeTotal += tx.amount;
            statsMap[tagName].count += 1;
          });
        }
      }
    });

    const sorted = [...tags]
      .map((t) => ({
        ...t,
        spend: statsMap[t.name]?.totalSpend || 0,
        count: statsMap[t.name]?.count || 0,
        percentage:
          totalExpense > 0
            ? ((statsMap[t.name]?.totalSpend || 0) / totalExpense) * 100
            : 0,
      }))
      .sort((a, b) => b.spend - a.spend);

    return {
      tagStats: sorted,
      totalExpenseSpend: totalExpense,
      untaggedTotal: untaggedExpTotal,
      untaggedCount: untaggedExpCount,
    };
  }, [transactions, tags]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!clean) return;
    success();
    onCreateTag(clean, newTagColor);
    setNewTagName('');
    setIsCreating(false);
  };

  const startEdit = (tag: CustomTag) => {
    tap('light');
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = (id: string) => {
    const clean = editName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (clean) {
      success();
      onUpdateTag(id, clean, editColor || TAG_COLOR_PALETTE[0].hex);
    }
    setEditingTagId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column: Top Tag Summary Card & Create Tag Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E0E2EC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E2EC]">
              <div>
                <h2 className="text-base font-bold text-[#1F1F1F] tracking-tight">
                  Custom Tags
                </h2>
                <p className="text-xs text-[#747775]">
                  {tags.length} custom tags organized
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(!isCreating)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-[#0B57D0] text-white rounded-full hover:bg-[#1A73E8] transition-colors shadow-xs active:scale-95 cursor-pointer min-h-[32px]"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>New Tag</span>
              </button>
            </div>

            {/* Create Tag Form */}
            {isCreating && (
              <form
                onSubmit={handleCreateSubmit}
                className="p-4 bg-[#F0F4F9] rounded-2xl space-y-3 border border-[#E0E2EC]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F1F1F]">
                    Add New Tag
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="w-6 h-6 rounded-full bg-[#747775]/20 flex items-center justify-center text-[#444746] hover:text-[#1F1F1F] cursor-pointer"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#747775]">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="tag-name (e.g. coffee, groceries)"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      autoFocus
                      className="w-full pl-7 pr-3 py-2 text-xs font-medium bg-white rounded-xl text-[#1F1F1F] placeholder:text-[#747775] focus:outline-none focus:ring-1 focus:ring-[#0B57D0] min-h-[38px] border border-[#C4C7C5]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newTagName.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-[#0B57D0] text-white rounded-xl hover:bg-[#1A73E8] disabled:opacity-40 min-h-[38px] transition-colors cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>

                {/* Color Selection */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-[#444746] font-medium">Color:</span>
                  {TAG_COLOR_PALETTE.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        selection();
                        setNewTagColor(col.hex);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                        newTagColor === col.hex ? 'ring-2 ring-offset-2 ring-[#0B57D0] scale-110' : ''
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.label}
                    >
                      {newTagColor === col.hex && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* Untagged spending status callout */}
            {untaggedCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#E8F0FE] border border-[#D3E3FD] flex items-center justify-between text-xs flex-wrap gap-2">
                <div>
                  <span className="font-semibold text-[#0B57D0]">
                    Untagged:
                  </span>{' '}
                  <span className="text-[#1F1F1F]">
                    {untaggedCount} transaction{untaggedCount > 1 ? 's' : ''} (
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(untaggedTotal, currency)}
                    </span>
                    )
                  </span>
                </div>
                <span className="text-[11px] text-[#747775] font-medium">
                  {formatPercentage(
                    totalExpenseSpend > 0 ? (untaggedTotal / totalExpenseSpend) * 100 : 0
                  )}{' '}
                  of spend
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tag Spending Rankings List */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-3 text-[12px] font-semibold text-[#444746] tracking-tight uppercase">
            <span>Spend by Tag</span>
            <span className="normal-case text-[11px] text-[#747775] font-normal">Ranked by volume</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E2EC] shadow-xs divide-y divide-[#E0E2EC] overflow-hidden">
            {tagStats.map((tag) => {
              const isEditing = editingTagId === tag.id;

              return (
                <div
                  key={tag.id}
                  className="p-3.5 hover:bg-[#F0F4F9] transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#F0F4F9] rounded-xl min-h-[36px] border border-[#C4C7C5] focus:outline-none focus:ring-1 focus:ring-[#0B57D0]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(tag.id)}
                          className="p-2 text-white bg-[#146C2E] rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                          <Check size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTagId(null)}
                          className="p-2 text-[#444746] bg-[#E0E2EC] rounded-xl hover:text-[#1F1F1F] cursor-pointer"
                        >
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {TAG_COLOR_PALETTE.map((col) => (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => setEditColor(col.hex)}
                            className={`w-5 h-5 rounded-full ${
                              editColor === col.hex ? 'ring-2 ring-offset-1 ring-[#0B57D0]' : ''
                            }`}
                            style={{ backgroundColor: col.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* Left: Tag Name */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onFilterByTag(tag.name)}
                            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F1F1F] hover:text-[#0B57D0] transition-colors cursor-pointer min-w-0"
                            title="Filter transactions by this tag"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="truncate max-w-[100px] sm:max-w-[180px]">#{tag.name}</span>
                            <ChevronRight
                              size={13}
                              className="opacity-40 group-hover:opacity-100 text-[#0B57D0] shrink-0"
                            />
                          </button>

                          <span className="text-[10px] sm:text-[11px] text-[#747775] tabular-nums shrink-0">
                            ({tag.count})
                          </span>
                        </div>

                        {/* Right: Spend Amount & Quick Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <span className="text-xs font-semibold tabular-nums text-[#1F1F1F] whitespace-nowrap">
                            {formatCurrency(tag.spend, currency)}
                          </span>

                          <div className="flex items-center pl-1 border-l border-[#E0E2EC] gap-0.5">
                            <button
                              type="button"
                              onClick={() => startEdit(tag)}
                              className="p-1 text-[#747775] hover:text-[#1F1F1F] transition-colors cursor-pointer active:scale-95"
                              aria-label={`Edit tag ${tag.name}`}
                            >
                              <Edit2 size={13} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                warning();
                                if (confirmDeleteTagId === tag.id) {
                                  onDeleteTag(tag.id, tag.name);
                                  setConfirmDeleteTagId(null);
                                } else {
                                  setConfirmDeleteTagId(tag.id);
                                  setTimeout(() => setConfirmDeleteTagId(null), 3000);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                                confirmDeleteTagId === tag.id
                                  ? 'bg-[#B3261E] text-white shadow-xs'
                                  : 'text-[#747775] hover:text-[#B3261E]'
                              }`}
                              aria-label={`Delete tag ${tag.name}`}
                              title={confirmDeleteTagId === tag.id ? 'Click to confirm delete' : 'Delete tag'}
                            >
                              <Trash2 size={13} strokeWidth={2} />
                              {confirmDeleteTagId === tag.id && <span className="whitespace-nowrap">Delete?</span>}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Material 3 Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-[#E0E2EC] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(0, tag.percentage))}%`,
                              backgroundColor: tag.color,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#747775] font-medium">
                          <span>{formatPercentage(tag.percentage)} of total</span>
                          {tag.spend > 0 && tag.count > 0 && (
                            <span>
                              avg {formatCurrency(tag.spend / tag.count, currency)}/tx
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {tagStats.length === 0 && (
              <div className="p-6 text-center text-xs text-[#747775]">
                No custom tags created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
