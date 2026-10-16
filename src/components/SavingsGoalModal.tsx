import React, { useState, useEffect } from 'react';
import { SavingsGoal, CurrencyConfig } from '../types/finance';
import { TAG_COLOR_PALETTE } from '../utils/constants';
import { useHaptics } from '../hooks/useHaptics';
import { PiggyBank, Trash2, Calendar, Target, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  editingGoal?: SavingsGoal | null;
  currency: CurrencyConfig;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingGoal,
  currency,
}) => {
  const { tap, success, warning } = useHaptics();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(TAG_COLOR_PALETTE[0].hex);
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setTargetDate(editingGoal.targetDate || '');
      setColor(editingGoal.color || TAG_COLOR_PALETTE[0].hex);
      setNote(editingGoal.note || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setColor(TAG_COLOR_PALETTE[0].hex);
      setNote('');
    }
    setIsConfirmingDelete(false);
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    if (!name.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    const parsedCurrent = parseFloat(currentAmount) || 0;

    success();
    onSave({
      ...(editingGoal ? { id: editingGoal.id } : {}),
      name: name.trim(),
      targetAmount: parsedTarget,
      currentAmount: Math.max(0, parsedCurrent),
      targetDate: targetDate || undefined,
      color,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F0F4F9] dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden text-[#1F1F1F] dark:text-[#F5F5F7]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="savings-modal-title"
      >
        {/* Drag Handle */}
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

          <h2 id="savings-modal-title" className="text-base font-bold text-[#1F1F1F] dark:text-white tracking-tight flex items-center gap-1.5">
            <PiggyBank size={18} className="text-[#9EE42A]" />
            <span>{editingGoal ? 'Edit Savings Target' : 'New Savings Target'}</span>
          </h2>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] px-4 py-1.5 rounded-full transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-95"
            disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          >
            {editingGoal ? 'Save' : 'Create'}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Target Name */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="goal-name" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
              Saving Goal Name
            </label>
            <input
              id="goal-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
              className="w-full text-base font-semibold bg-transparent text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden"
              maxLength={80}
            />
          </div>

          {/* Target Amount & Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
              <label htmlFor="goal-target-amount" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
                Target Amount ({currency.symbol})
              </label>
              <div className="relative flex items-center">
                <span className="text-xl font-bold text-[#1F1F1F] dark:text-white mr-1.5 select-none">
                  {currency.symbol}
                </span>
                <input
                  id="goal-target-amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xl font-bold bg-transparent text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden tabular-nums"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
              <label htmlFor="goal-current-amount" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1">
                Already Saved ({currency.symbol})
              </label>
              <div className="relative flex items-center">
                <span className="text-xl font-bold text-[#146C2E] dark:text-[#30D158] mr-1.5 select-none">
                  {currency.symbol}
                </span>
                <input
                  id="goal-current-amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xl font-bold bg-transparent text-[#146C2E] dark:text-[#30D158] placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Color Tag Picker */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-2">
            <span className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93]">
              Target Color Theme
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {TAG_COLOR_PALETTE.map((pal) => (
                <button
                  key={pal.hex}
                  type="button"
                  onClick={() => {
                    tap('light');
                    setColor(pal.hex);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    color === pal.hex ? 'scale-110 ring-2 ring-offset-2 ring-[#007AFF] dark:ring-white dark:ring-offset-[#2C2C2E]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: pal.hex }}
                  aria-label={pal.label}
                />
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-3.5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="goal-date" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Target Completion Date (Optional)</span>
            </label>
            <input
              id="goal-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#1F1F1F] dark:text-white focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-3.5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08]">
            <label htmlFor="goal-note" className="block text-[11px] font-medium text-[#444746] dark:text-[#8E8E93] mb-1.5 flex items-center gap-1.5">
              <FileText size={13} />
              <span>Goal Note / Motivation (Optional)</span>
            </label>
            <textarea
              id="goal-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this goal matters, milestones, or monthly contribution plans..."
              className="w-full bg-transparent text-sm text-[#1F1F1F] dark:text-white placeholder-[#747775] dark:placeholder-[#636366] focus:outline-hidden resize-none"
              maxLength={400}
            />
          </div>

          {/* Delete Action if editing */}
          {editingGoal && onDelete && (
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
                  <span>Delete This Savings Target</span>
                </button>
              ) : (
                <div className="p-3 bg-[#FF3B30]/10 rounded-2xl border border-[#FF3B30]/30 text-center space-y-2">
                  <p className="text-xs font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                    Delete "{editingGoal.name}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        warning();
                        onDelete(editingGoal.id);
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
