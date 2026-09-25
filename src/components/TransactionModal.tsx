import React, { useState, useEffect } from 'react';
import {
  Transaction,
  TransactionType,
  Category,
  CustomTag,
  CurrencyConfig,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { TagChip } from './TagChip';
import { getTodayDateString } from '../utils/formatters';
import { Plus, Trash2, Calendar, Tag as TagIcon, FileText } from 'lucide-react';
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
}) => {
  const { tap, selection, success, warning } = useHaptics();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      const firstExp = categories.find((c) => c.type === 'expense' || c.type === 'both');
      setCategory(firstExp ? firstExp.name : categories[0]?.name || '');
      setSelectedTags([]);
      setDate(getTodayDateString());
      setNote('');
    }
    setNewTagInput('');
    setShowTagInput(false);
    setIsConfirmingDelete(false);
  }, [editingTransaction, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

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
      category: category || filteredCategories[0]?.name || 'Miscellaneous',
      customTags: selectedTags,
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
        className="w-full max-w-lg bg-[#F0F4F9] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden text-[#1F1F1F]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Android MD3 Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-8 h-1 bg-[#747775]/40 rounded-full" />
        </div>

        {/* Android Material Design 3 App Bar Header */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F0F4F9] border-b border-[#E0E2EC]">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#444746] hover:text-[#1F1F1F] px-2.5 py-1 rounded-full hover:bg-[#E0E2EC]/50 transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>

          <h2 id="modal-title" className="text-base font-bold text-[#1F1F1F] tracking-tight">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm font-semibold text-white bg-[#0B57D0] hover:bg-[#1A73E8] px-4 py-1.5 rounded-full transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
            disabled={!title.trim() || !amount}
          >
            {editingTransaction ? 'Save' : 'Add'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Material 3 Segmented Pill (Expense / Income) */}
          <div className="flex p-1 bg-[#E0E2EC]/70 rounded-full">
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
                  ? 'bg-white text-[#B3261E] shadow-xs'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              <span>Expense</span>
            </button>
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
                  ? 'bg-white text-[#146C2E] shadow-xs'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              <span>Income</span>
            </button>
          </div>

          {/* Amount Inset Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC]">
            <label htmlFor="tx-amount" className="block text-[11px] font-medium text-[#444746] mb-1">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="text-3xl font-semibold text-[#0B57D0] mr-1.5 select-none">
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
                className="w-full py-1 text-3xl font-bold tracking-tight text-[#1F1F1F] placeholder:text-[#C4C7C5] focus:outline-none tabular-nums bg-transparent"
              />
            </div>
          </div>

          {/* Title & Notes Inset Group */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#E0E2EC] divide-y divide-[#E0E2EC] overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-[#444746] w-24 shrink-0">Payee / Title</span>
              <input
                id="tx-title"
                type="text"
                required
                placeholder="e.g. Coffee, Groceries, Rent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm text-[#1F1F1F] placeholder:text-[#C4C7C5] focus:outline-none bg-transparent"
              />
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-[#444746] w-24 shrink-0 flex items-center gap-1.5">
                <FileText size={15} className="text-[#747775]" />
                <span>Note</span>
              </span>
              <input
                id="tx-note"
                type="text"
                placeholder="Optional note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-sm text-[#1F1F1F] placeholder:text-[#C4C7C5] focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Category Picker Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#444746] uppercase tracking-wider">
                Category
              </span>
              <span className="text-xs font-semibold text-[#0B57D0]">
                {category}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      selection();
                      setCategory(cat.name);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all min-h-[58px] cursor-pointer ${
                      isSelected
                        ? 'bg-[#D3E3FD] text-[#041E49] ring-2 ring-[#0B57D0]'
                        : 'text-[#1F1F1F] hover:bg-[#F0F4F9]'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 shrink-0"
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

          {/* Custom Tags Section */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TagIcon size={15} className="text-[#747775]" />
                <span className="text-[12px] font-semibold text-[#444746] uppercase tracking-wider">
                  Tags ({selectedTags.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-xs font-semibold text-[#0B57D0] hover:bg-[#E8F0FE] px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>New Tag</span>
              </button>
            </div>

            {/* Inline New Tag Form */}
            {showTagInput && (
              <div className="p-3 bg-[#F0F4F9] rounded-xl space-y-2 border border-[#E0E2EC]">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#747775]">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="tag-name (e.g. coffee, groceries)"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateNewTag();
                        }
                      }}
                      autoFocus
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-medium bg-white rounded-lg text-[#1F1F1F] placeholder:text-[#747775] border border-[#C4C7C5] focus:outline-none focus:border-[#0B57D0] min-h-[34px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    disabled={!newTagInput.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#0B57D0] text-white rounded-lg hover:bg-[#1A73E8] disabled:opacity-40 min-h-[34px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-[#444746]">Color:</span>
                  {TAG_COLOR_PALETTE.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setNewTagColor(col.hex)}
                      className={`w-4 h-4 rounded-full ${
                        newTagColor === col.hex ? 'ring-2 ring-offset-1 ring-[#0B57D0]' : ''
                      }`}
                      style={{ backgroundColor: col.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selected Tags Capsules */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F0F4F9] rounded-xl border border-[#E0E2EC]/70">
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
                        ? 'bg-[#1F1F1F] text-white shadow-xs'
                        : 'bg-[#F0F4F9] text-[#1F1F1F] hover:bg-[#E0E2EC]'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : tag.color }}
                    />
                    <span>#{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Selector Inset */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="tx-date" className="text-[12px] font-semibold text-[#444746] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#747775]" />
                <span>Date</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRelativeDate(0)}
                  className={`text-xs px-3 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    date === getTodayDateString()
                      ? 'bg-[#0B57D0] text-white shadow-xs'
                      : 'text-[#444746] hover:bg-[#F0F4F9]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRelativeDate(1)}
                  className="text-xs px-3 py-0.5 rounded-full text-[#444746] hover:bg-[#F0F4F9] font-medium cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F0F4F9] rounded-xl text-sm font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] min-h-[42px] border border-[#E0E2EC]"
            />
          </div>

          {/* Delete Action if editing */}
          {editingTransaction && onDelete && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  warning();
                  if (isConfirmingDelete) {
                    onDelete(editingTransaction.id);
                    onClose();
                  } else {
                    setIsConfirmingDelete(true);
                  }
                }}
                className={`w-full py-3 rounded-2xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isConfirmingDelete
                    ? 'bg-[#B3261E] text-white border-[#B3261E] shadow-md animate-pulse'
                    : 'bg-white text-[#B3261E] hover:bg-[#F9DEDC] border-[#F9DEDC]'
                }`}
              >
                <Trash2 size={16} />
                <span>
                  {isConfirmingDelete ? 'Tap Again to Confirm Delete' : 'Delete Transaction'}
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
