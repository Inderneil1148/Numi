import React, { useState, useEffect } from 'react';
import { Subscription, CurrencyConfig, Category } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { useHaptics } from '../hooks/useHaptics';
import { Repeat, Trash2, Calendar, FileText, Check } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  editingSubscription?: Subscription | null;
  currency: CurrencyConfig;
  categories?: Category[];
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSubscription,
  currency,
  categories = DEFAULT_CATEGORIES,
}) => {
  const { tap, success, warning } = useHaptics();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Entertainment');
  const [billingDay, setBillingDay] = useState<number>(1);
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setAmount(editingSubscription.amount.toString());
      setCategory(editingSubscription.category || categories[0]?.name || 'Entertainment');
      setBillingDay(editingSubscription.billingDay || 1);
      setStatus(editingSubscription.status || 'active');
      setNote(editingSubscription.note || '');
    } else {
      setName('');
      setAmount('');
      const defaultCat = categories.find((c) => c.name.toLowerCase().includes('entertainment')) || categories[0];
      setCategory(defaultCat?.name || 'Entertainment');
      const todayDay = new Date().getDate();
      setBillingDay(todayDay);
      setStatus('active');
      setNote('');
    }
    setIsConfirmingDelete(false);
  }, [editingSubscription, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    success();
    onSave({
      ...(editingSubscription ? { id: editingSubscription.id } : {}),
      name: name.trim(),
      amount: parsedAmount,
      category,
      billingDay: Math.min(31, Math.max(1, billingDay)),
      status,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const daySuggestions = [1, 5, 10, 15, 20, 25, 28];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F0F4F9] dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden text-[#1F1F1F] dark:text-[#F5F5F7]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-8 h-1 bg-[#747775]/40 dark:bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F0F4F9] dark:bg-[#1C1C1E] border-b border-[#E0E2EC] dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E8E93] dark:hover:text-white px-2.5 py-1 rounded-full hover:bg-[#E0E2EC]/50 dark:hover:bg-white/[0.08] transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>

          <h2 id="subscription-modal-title" className="text-base font-bold text-[#1F1F1F] dark:text-white tracking-tight flex items-center gap-1.5">
            <Repeat size={18} className="text-[#5856D6] dark:text-[#AF52DE]" />
            <span>{editingSubscription ? 'Edit Subscription' : 'New Subscription'}</span>
          </h2>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] px-4 py-1.5 rounded-full transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
            disabled={!name.trim() || !amount || parseFloat(amount) <= 0}
          >
            {editingSubscription ? 'Save' : 'Add'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Subscription Name */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="sub-name" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
              Subscription or Service Name
            </label>
            <input
              id="sub-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix, Spotify, Gym, Cloud Storage"
              className="w-full text-base font-semibold bg-transparent text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden"
              maxLength={80}
            />
          </div>

          {/* Amount per month */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="sub-amount" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
              Monthly Cost ({currency.symbol})
            </label>
            <div className="relative flex items-center">
              <span className="text-xl font-bold text-[#1F1F1F] dark:text-white mr-1.5 select-none">
                {currency.symbol}
              </span>
              <input
                id="sub-amount"
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-xl font-bold bg-transparent text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden tabular-nums"
              />
              <span className="text-xs text-[#86868B] dark:text-[#8E8E93] font-medium">
                / month
              </span>
            </div>
          </div>

          {/* Billing Day of Month */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="sub-billing-day" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Renewal Day of Month</span>
              </label>
              <span className="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF]">
                Day {billingDay} of every month
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="sub-billing-day"
                type="range"
                min="1"
                max="31"
                value={billingDay}
                onChange={(e) => {
                  tap('light');
                  setBillingDay(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#007AFF] cursor-pointer"
              />
            </div>

            {/* Quick Day Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {daySuggestions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    tap('light');
                    setBillingDay(d);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                    billingDay === d
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : 'bg-[#F2F2F7] dark:bg-[#3A3A3C] text-[#444746] dark:text-[#8E8E93] hover:text-[#1F1F1F] dark:hover:text-white'
                  }`}
                >
                  {d}th
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2">
            <span className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93]">
              Category
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.slice(0, 9).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    tap('light');
                    setCategory(cat.name);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    category === cat.name
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]'
                      : 'border-[#E0E2EC] dark:border-white/10 hover:border-[#007AFF]/30 text-[#1F1F1F] dark:text-white'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <CategoryIcon iconName={cat.iconName} size={14} />
                  </div>
                  <span className="text-xs font-semibold truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Toggle (Active vs. Paused) */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#1F1F1F] dark:text-white block">
                Subscription Status
              </span>
              <span className="text-[11px] text-[#86868B] dark:text-[#8E8E93]">
                {status === 'active' ? 'Active & monthly reminders enabled' : 'Paused (reminders muted)'}
              </span>
            </div>
            <div className="flex bg-[#F2F2F7] dark:bg-[#3A3A3C] p-1 rounded-full">
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setStatus('active');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  status === 'active'
                    ? 'bg-white text-[#146C2E] shadow-xs dark:bg-[#1C1C1E] dark:text-[#30D158]'
                    : 'text-[#86868B] dark:text-[#8E8E93]'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setStatus('paused');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  status === 'paused'
                    ? 'bg-white text-[#FF9500] shadow-xs dark:bg-[#1C1C1E] dark:text-[#FF9F0A]'
                    : 'text-[#86868B] dark:text-[#8E8E93]'
                }`}
              >
                Paused
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-3.5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="sub-note" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1.5 flex items-center gap-1.5">
              <FileText size={13} />
              <span>Notes (Optional)</span>
            </label>
            <input
              id="sub-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Shared family plan, auto-renews via Apple Pay"
              className="w-full bg-transparent text-sm text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden"
              maxLength={200}
            />
          </div>

          {/* Delete Action if editing */}
          {editingSubscription && onDelete && (
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
                  <span>Delete This Subscription</span>
                </button>
              ) : (
                <div className="p-3 bg-[#FF3B30]/10 rounded-2xl border border-[#FF3B30]/30 text-center space-y-2">
                  <p className="text-xs font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                    Delete "{editingSubscription.name}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        warning();
                        onDelete(editingSubscription.id);
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
