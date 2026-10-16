import React, { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionType,
  Category,
  CustomTag,
  CurrencyConfig,
  SavingsGoal,
  Subscription,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { TagChip } from './TagChip';
import { getTodayDateString, formatCurrency } from '../utils/formatters';
import { Plus, Trash2, Calendar, Tag as TagIcon, FileText, PiggyBank, Repeat, Target } from 'lucide-react';
import { TAG_COLOR_PALETTE } from '../utils/constants';
import { useHaptics } from '../hooks/useHaptics';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  availableTags: CustomTag[];
  onCreateTag: (tagName: string, color?: string) => CustomTag;
  currency: CurrencyConfig;
  savingsGoals?: SavingsGoal[];
  onOpenNewGoalModal?: () => void;
  subscriptions?: Subscription[];
  initialType?: TransactionType;
  initialSavingsGoalId?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  categories,
  availableTags,
  onCreateTag,
  currency,
  savingsGoals = [],
  onOpenNewGoalModal,
  subscriptions = [],
  initialType,
  initialSavingsGoalId,
}) => {
  const { tap, success, warning } = useHaptics();

  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(initialSavingsGoalId || '');
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [showTagInput, setShowTagInput] = useState<boolean>(false);
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PALETTE[0].hex);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setTitle(editingTransaction.title);
      setCategory(editingTransaction.category);
      setSelectedTags(editingTransaction.customTags || []);
      setSelectedGoalId(editingTransaction.savingsGoalId || (savingsGoals[0]?.id ?? ''));
      setIsSubscription(Boolean(editingTransaction.isSubscription));
      setSelectedSubId(editingTransaction.subscriptionId || '');
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      const defaultType = initialType || 'expense';
      setType(defaultType);
      setAmount('');
      if (defaultType === 'savings') {
        const goal = savingsGoals.find((g) => g.id === initialSavingsGoalId) || savingsGoals[0];
        setSelectedGoalId(goal ? goal.id : '');
        setTitle(goal ? `Deposit to ${goal.name}` : 'Deposit to Savings');
        setCategory('Savings & Goals');
      } else {
        setTitle('');
        const firstExp = categories.find((c) => c.type === 'expense' || c.type === 'both');
        setCategory(firstExp ? firstExp.name : categories[0]?.name || '');
      }
      setSelectedTags([]);
      setIsSubscription(false);
      setSelectedSubId('');
      setDate(getTodayDateString());
      setNote('');
    }
    setNewTagInput('');
    setShowTagInput(false);
    setIsConfirmingDelete(false);
  }, [editingTransaction, isOpen, categories, initialType, initialSavingsGoalId, savingsGoals]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => {
    if (type === 'savings') return c.name.toLowerCase().includes('savings') || c.type === 'both';
    return c.type === type || c.type === 'both';
  });

  const handleToggleTag = (tagName: string) => {
    tap('light');
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCreateNewTag = () => {
    const trimmed = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!trimmed) return;

    tap('medium');
    const existing = availableTags.find((t) => t.name.toLowerCase() === trimmed);
    if (!existing) {
      onCreateTag(trimmed, newTagColor);
    }

    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }

    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleSelectGoal = (goalId: string) => {
    tap('light');
    setSelectedGoalId(goalId);
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (goal && (!title || title.startsWith('Deposit to'))) {
      setTitle(`Deposit to ${goal.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!title.trim()) return;

    success();
    onSave({
      ...(editingTransaction ? { id: editingTransaction.id } : {}),
      type,
      amount: parsedAmount,
      title: title.trim(),
      category: category || filteredCategories[0]?.name || (type === 'savings' ? 'Savings & Goals' : 'Miscellaneous'),
      // REMOVE TAGS FROM SAVINGS: always empty array when type === 'savings'
      customTags: type === 'savings' ? [] : selectedTags,
      savingsGoalId: type === 'savings' ? selectedGoalId || undefined : undefined,
      isSubscription: type === 'expense' ? isSubscription : undefined,
      subscriptionId: type === 'expense' && isSubscription ? selectedSubId || undefined : undefined,
      date,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const setRelativeDate = (offset: number) => {
    tap('light');
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${day}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F0F4F9] dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden text-[#1F1F1F] dark:text-[#F5F5F7]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Android MD3 Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-8 h-1 bg-[#747775]/40 dark:bg-white/20 rounded-full" />
        </div>

        {/* Material Design 3 Header */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F0F4F9] dark:bg-[#1C1C1E] border-b border-[#E0E2EC] dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E8E93] dark:hover:text-white px-2.5 py-1 rounded-full hover:bg-[#E0E2EC]/50 dark:hover:bg-white/[0.08] transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>

          <h2 id="modal-title" className="text-base font-bold text-[#1F1F1F] dark:text-white tracking-tight">
            {editingTransaction
              ? 'Edit Entry'
              : type === 'savings'
              ? 'Add to Savings'
              : 'New Transaction'}
          </h2>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] px-4 py-1.5 rounded-full transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
            disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
          >
            {editingTransaction ? 'Save' : 'Add'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Segmented Control with Savings Option */}
          <div className="flex p-1 bg-[#E0E2EC]/70 dark:bg-[#2C2C2E] rounded-full">
            {/* Expense */}
            <button
              type="button"
              onClick={() => {
                tap('light');
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense' || c.type === 'both');
                if (firstExp) setCategory(firstExp.name);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[34px] flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-[#B3261E] shadow-xs dark:bg-[#1C1C1E] dark:text-[#FF453A] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
                  : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <span>Expense</span>
            </button>

            {/* Income */}
            <button
              type="button"
              onClick={() => {
                tap('light');
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income' || c.type === 'both');
                if (firstInc) setCategory(firstInc.name);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[34px] flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-[#146C2E] shadow-xs dark:bg-[#1C1C1E] dark:text-[#30D158] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
                  : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <span>Income</span>
            </button>

            {/* Savings (New Option requested by User) */}
            <button
              type="button"
              onClick={() => {
                tap('light');
                setType('savings');
                setCategory('Savings & Goals');
                if (!title || title.startsWith('Deposit to')) {
                  const goal = savingsGoals.find((g) => g.id === selectedGoalId) || savingsGoals[0];
                  if (goal) {
                    setTitle(`Deposit to ${goal.name}`);
                    setSelectedGoalId(goal.id);
                  } else {
                    setTitle('Deposit to Savings');
                  }
                }
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[34px] flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'savings'
                  ? 'bg-white text-[#2B540A] shadow-xs dark:bg-[#1C1C1E] dark:text-[#9EE42A] dark:shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
                  : 'text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <PiggyBank size={14} className="text-[#9EE42A]" />
              <span>Savings</span>
            </button>
          </div>

          {/* Amount Inset Card */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="tx-amount" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
              {type === 'savings' ? 'Saving Amount' : 'Amount'}
            </label>
            <div className="relative flex items-center">
              <span
                className={`text-3xl font-semibold mr-1.5 select-none ${
                  type === 'savings'
                    ? 'text-[#2B540A] dark:text-[#9EE42A]'
                    : type === 'income'
                    ? 'text-[#146C2E] dark:text-[#30D158]'
                    : 'text-[#007AFF] dark:text-[#0A84FF]'
                }`}
              >
                {currency.symbol}
              </span>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus={!editingTransaction}
                className="w-full py-1 text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-white placeholder:text-[#C4C7C5] dark:placeholder:text-[#636366] focus:outline-none tabular-nums bg-transparent"
              />
            </div>
          </div>

          {/* Savings Goal Picker (Only when type === 'savings') */}
          {type === 'savings' && (
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#9EE42A]/30 dark:border-[#9EE42A]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#1F1F1F] dark:text-white flex items-center gap-1.5">
                  <Target size={15} className="text-[#9EE42A]" />
                  <span>Choose Saving Goal</span>
                </span>
                {onOpenNewGoalModal && (
                  <button
                    type="button"
                    onClick={() => {
                      tap('light');
                      onOpenNewGoalModal();
                    }}
                    className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>New Target</span>
                  </button>
                )}
              </div>

              {savingsGoals.length === 0 ? (
                <div className="p-3 bg-[#F8F9FA] dark:bg-[#1C1C1E] rounded-xl text-center space-y-1.5 border border-dashed border-[#E0E2EC] dark:border-white/10">
                  <p className="text-xs text-[#86868B] dark:text-[#8E8E93]">
                    No savings targets created yet.
                  </p>
                  {onOpenNewGoalModal && (
                    <button
                      type="button"
                      onClick={onOpenNewGoalModal}
                      className="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] hover:underline"
                    >
                      + Create a Target (e.g. Emergency Fund)
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savingsGoals.map((g) => {
                      const isSelected = selectedGoalId === g.id;
                      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleSelectGoal(g.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#9EE42A] bg-[#9EE42A]/10 text-[#1F1F1F] dark:text-white ring-1 ring-[#9EE42A]'
                              : 'border-[#E0E2EC] dark:border-white/10 hover:border-[#9EE42A]/40 text-[#444746] dark:text-[#8E8E93]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span className="text-xs font-bold text-[#1D1D1F] dark:text-white truncate">
                              {g.name}
                            </span>
                            <span className="text-[10px] font-semibold text-[#274008] dark:text-[#9EE42A] tabular-nums">
                              {pct}%
                            </span>
                          </div>
                          <span className="text-[11px] text-[#86868B] dark:text-[#8E8E93] tabular-nums mt-1">
                            {formatCurrency(g.currentAmount, currency)} of {formatCurrency(g.targetAmount, currency)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title & Notes Inset Group */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] divide-y divide-[#E0E2EC] dark:divide-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-[#444746] dark:text-[#8E8E93] w-24 shrink-0">
                {type === 'savings' ? 'Goal Memo' : 'Payee / Title'}
              </span>
              <input
                id="tx-title"
                type="text"
                required
                placeholder={type === 'savings' ? 'e.g. Deposit to Emergency Fund' : 'e.g. Coffee, Groceries, Rent'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm text-[#1F1F1F] dark:text-white placeholder:text-[#C4C7C5] dark:placeholder:text-[#636366] focus:outline-none bg-transparent"
              />
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-[#444746] dark:text-[#8E8E93] w-24 shrink-0 flex items-center gap-1.5">
                <FileText size={15} className="text-[#747775] dark:text-[#8E8E93]" />
                <span>Note</span>
              </span>
              <input
                id="tx-note"
                type="text"
                placeholder="Optional memo or description"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-sm text-[#1F1F1F] dark:text-white placeholder:text-[#C4C7C5] dark:placeholder:text-[#636366] focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Optional: Tag as Recurring Subscription (only for expenses) */}
          {type === 'expense' && (
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-3.5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat size={16} className="text-[#5856D6] dark:text-[#AF52DE]" />
                  <span className="text-xs font-semibold text-[#1F1F1F] dark:text-white">
                    Recurring Subscription
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="tx-is-sub"
                  checked={isSubscription}
                  onChange={(e) => {
                    tap('light');
                    setIsSubscription(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-[#5856D6] accent-[#5856D6] cursor-pointer"
                />
              </div>

              {isSubscription && subscriptions.length > 0 && (
                <div className="pt-1.5">
                  <label htmlFor="tx-sub-select" className="block text-[10px] text-[#86868B] dark:text-[#8E8E93] mb-1">
                    Link to subscription:
                  </label>
                  <select
                    id="tx-sub-select"
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl bg-[#F0F4F9] dark:bg-[#1C1C1E] border border-[#E0E2EC] dark:border-white/10 text-[#1F1F1F] dark:text-white"
                  >
                    <option value="">(Standalone monthly expense)</option>
                    {subscriptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatCurrency(s.amount, currency)}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Category Picker (Only when not pure savings, or default) */}
          {type !== 'savings' && (
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#444746] dark:text-[#8E8E93] uppercase tracking-wider">
                  Category
                </span>
                <span className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF]">
                  {category || 'Select'}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto">
                {filteredCategories.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        tap('light');
                        setCategory(cat.name);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]'
                          : 'border-[#E0E2EC] dark:border-white/10 hover:border-[#007AFF]/30 text-[#444746] dark:text-[#8E8E93]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon iconName={cat.iconName} size={15} />
                      </div>
                      <span className="text-[10px] font-medium leading-tight truncate w-full px-0.5">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Tags Section: STRICTLY REMOVED WHEN type === 'savings' per prompt instructions */}
          {type !== 'savings' && (
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TagIcon size={15} className="text-[#747775] dark:text-[#8E8E93]" />
                  <span className="text-[12px] font-semibold text-[#444746] dark:text-[#8E8E93] uppercase tracking-wider">
                    Tags ({selectedTags.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#E8F0FE] dark:hover:bg-white/[0.08] px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>New Tag</span>
                </button>
              </div>

              {/* Inline New Tag Form */}
              {showTagInput && (
                <div className="p-3 bg-[#F0F4F9] dark:bg-[#1C1C1E] rounded-xl space-y-2 border border-[#E0E2EC] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#747775] dark:text-[#8E8E93]">
                        #
                      </span>
                      <input
                        type="text"
                        placeholder="tag-name (e.g. travel, work)"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateNewTag();
                          }
                        }}
                        autoFocus
                        className="w-full pl-7 pr-3 py-1.5 text-xs font-medium bg-white dark:bg-[#2C2C2E] rounded-lg text-[#1F1F1F] dark:text-white placeholder:text-[#747775] dark:placeholder:text-[#636366] border border-[#C4C7C5] dark:border-white/[0.1] focus:outline-none focus:border-[#007AFF] dark:focus:border-[#0A84FF] min-h-[34px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateNewTag}
                      disabled={!newTagInput.trim()}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#007AFF] dark:bg-[#0A84FF] text-white rounded-lg hover:bg-[#0071E3] disabled:opacity-40 min-h-[34px] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-[#444746] dark:text-[#8E8E93]">Color:</span>
                    {TAG_COLOR_PALETTE.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setNewTagColor(col.hex)}
                        className={`w-4 h-4 rounded-full ${
                          newTagColor === col.hex ? 'ring-2 ring-offset-1 ring-[#007AFF] dark:ring-[#0A84FF]' : ''
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Tags Capsules */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F0F4F9] dark:bg-[#1C1C1E] rounded-xl border border-[#E0E2EC]/70 dark:border-white/[0.06]">
                  {selectedTags.map((tagName) => (
                    <TagChip
                      key={tagName}
                      name={tagName}
                      onRemove={() => handleToggleTag(tagName)}
                      size="sm"
                      isSelected
                    />
                  ))}
                </div>
              )}

              {/* Available Tags Quick Chips Picker */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.name)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 min-h-[28px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F1F1F] text-white shadow-xs dark:bg-white dark:text-black'
                          : 'bg-[#F0F4F9] text-[#1F1F1F] hover:bg-[#E0E2EC] dark:bg-[#3A3A3C] dark:text-[#F5F5F7] dark:hover:bg-[#48484A]'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? undefined : tag.color }}
                      />
                      <span>#{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Selector Inset */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="tx-date" className="text-[12px] font-semibold text-[#444746] dark:text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#747775] dark:text-[#8E8E93]" />
                <span>Date</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRelativeDate(0)}
                  className={`text-xs px-3 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    date === getTodayDateString()
                      ? 'bg-[#007AFF] text-white shadow-xs dark:bg-[#0A84FF]'
                      : 'text-[#444746] hover:bg-[#F0F4F9] dark:text-[#8E8E93] dark:hover:bg-[#3A3A3C]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(1)}
                  className="text-xs px-3 py-0.5 rounded-full text-[#444746] hover:bg-[#F0F4F9] dark:text-[#8E8E93] dark:hover:bg-[#3A3A3C] font-medium cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent text-[#1F1F1F] dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Delete Action if editing */}
          {editingTransaction && onDelete && (
            <div className="pt-2">
              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    warning();
                    setIsConfirmingDelete(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl border border-[#FF3B30]/30 hover:bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
                >
                  <Trash2 size={15} />
                  <span>Delete This Transaction</span>
                </button>
              ) : (
                <div className="p-3 bg-[#FF3B30]/10 rounded-2xl border border-[#FF3B30]/30 text-center space-y-2">
                  <p className="text-xs font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                    Delete "{editingTransaction.title}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        warning();
                        onDelete(editingTransaction.id);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#FF3B30] text-white rounded-xl text-xs font-bold hover:bg-[#E0261C] transition-all cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="flex-1 py-2 bg-[#E0E2EC] dark:bg-[#3A3A3C] text-[#1F1F1F] dark:text-white rounded-xl text-xs font-semibold hover:bg-[#D3D6E0] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
