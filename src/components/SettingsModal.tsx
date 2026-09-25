import React, { useState } from 'react';
import { CurrencyConfig, BudgetConfig, Transaction, CustomTag } from '../types/finance';
import { SUPPORTED_CURRENCIES } from '../utils/formatters';
import { exportToCSV } from '../utils/storage';
import {
  Coins,
  Target,
  Download,
  Upload,
  RotateCcw,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { NumiLogo } from './NumiLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onUpdateCurrency: (c: CurrencyConfig) => void;
  budget: BudgetConfig;
  onUpdateBudget: (b: BudgetConfig) => void;
  transactions: Transaction[];
  tags: CustomTag[];
  onDeleteAllData: () => void;
  onLoadDemoData?: () => void;
  onImportData: (data: { transactions: Transaction[]; tags: CustomTag[] }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onUpdateCurrency,
  budget,
  onUpdateBudget,
  transactions,
  tags,
  onDeleteAllData,
  onLoadDemoData,
  onImportData,
}) => {
  const { tap, success, warning } = useHaptics();
  const [budgetInput, setBudgetInput] = useState(budget.monthlyLimit.toString());
  const [savedBudgetNotice, setSavedBudgetNotice] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBudgetSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      success();
      onUpdateBudget({ ...budget, monthlyLimit: val });
      setSavedBudgetNotice(true);
      setTimeout(() => setSavedBudgetNotice(false), 2000);
    }
  };

  const handleExportJSON = () => {
    tap('light');
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      currency,
      budget,
      tags,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `numi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSVFile = () => {
    tap('light');
    exportToCSV(transactions, currency.symbol);
  };

  const handleCurrencySelect = (curr: CurrencyConfig) => {
    tap('medium');
    onUpdateCurrency(curr);
  };

  const handleDoneClick = () => {
    tap('light');
    onClose();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.transactions)) {
          success();
          onImportData({
            transactions: parsed.transactions,
            tags: Array.isArray(parsed.tags) ? parsed.tags : tags,
          });
          setImportNotice('✓ Data restored successfully');
          setTimeout(() => {
            setImportNotice(null);
            onClose();
          }, 1200);
        } else {
          warning();
          setImportNotice('✕ Invalid backup file format');
          setTimeout(() => setImportNotice(null), 3000);
        }
      } catch {
        warning();
        setImportNotice('✕ Could not read JSON file');
        setTimeout(() => setImportNotice(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#F2F2F7] rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#1D1D1F]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* iOS Grabber Pill */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-9 h-1 bg-[#8E8E93]/40 rounded-full" />
        </div>

        {/* Navigation Bar Header */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F2F2F7] border-b border-black/[0.05]">
          <span className="w-12" />
          <h2 id="settings-title" className="text-base font-semibold text-[#1D1D1F] tracking-tight">
            Settings
          </h2>
          <button
            type="button"
            onClick={handleDoneClick}
            className="text-base font-semibold text-[#007AFF] hover:opacity-70 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Inset Grouped Settings Body (iOS Settings App Style) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Currency Section */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-3 flex items-center gap-1.5">
              <Coins size={13} />
              <span>Base Currency</span>
            </span>

            <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-black/[0.04] divide-y divide-black/[0.04] overflow-hidden">
              <div className="p-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const isSelected = curr.code === currency.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencySelect(curr)}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-[#007AFF] text-white shadow-xs'
                          : 'bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {curr.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-medium opacity-80">
                          {curr.code}
                        </span>
                      </div>
                      <div className="text-[10px] truncate opacity-85 mt-0.5">
                        {curr.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Budget Cap */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-3 flex items-center gap-1.5">
              <Target size={13} />
              <span>Monthly Budget Cap</span>
            </span>

            <form
              onSubmit={handleBudgetSave}
              className="bg-white rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#86868B] tabular-nums">
                  {currency.symbol}
                </span>
                <input
                  id="budget-input"
                  type="number"
                  min="0"
                  step="50"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full text-xl font-bold tracking-tight text-[#1D1D1F] focus:outline-none tabular-nums bg-transparent"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-[#007AFF] text-white rounded-full hover:bg-[#0071E3] transition-colors flex items-center gap-1 shrink-0"
                >
                  {savedBudgetNotice ? <Check size={13} strokeWidth={2.5} /> : null}
                  <span>{savedBudgetNotice ? 'Saved' : 'Update'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Data Management Section */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-3">
              Data & Export
            </span>

            <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-black/[0.04] divide-y divide-black/[0.04] overflow-hidden">
              <button
                type="button"
                onClick={handleExportCSVFile}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#F2F2F7]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
                    <Download size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#1D1D1F] block">
                      Export CSV Spreadsheet
                    </span>
                    <span className="text-[11px] text-[#86868B]">
                      Open in Apple Numbers or Excel
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#F2F2F7]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
                    <Download size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#1D1D1F] block">
                      Backup JSON Snapshot
                    </span>
                    <span className="text-[11px] text-[#86868B]">
                      Preserves all transactions and tags
                    </span>
                  </div>
                </div>
              </button>

              <label className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#F2F2F7]/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
                    <Upload size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#1D1D1F] block">
                      Restore Backup File
                    </span>
                    <span className="text-[11px] text-[#86868B]">
                      {importNotice || 'Select an existing .json snapshot'}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {/* Danger Zone: Delete & Reset All Data Button */}
              <button
                type="button"
                onClick={() => {
                  warning();
                  setShowWarningModal(true);
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#FF3B30]/5 transition-colors cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Trash2 size={15} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#FF3B30] block">
                      Delete & Erase All Transactions
                    </span>
                    <span className="text-[11px] text-[#86868B]">
                      Reset balances to zero and permanently clear data
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20">
                  Zero Out
                </span>
              </button>

              {/* Optional: Restore Sample Demo Transactions */}
              {onLoadDemoData && (
                <button
                  type="button"
                  onClick={() => {
                    tap('medium');
                    onLoadDemoData();
                    onClose();
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-black/[0.03] transition-colors cursor-pointer border-t border-black/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-black/[0.05] text-[#636366] flex items-center justify-center">
                      <RotateCcw size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#636366] block">
                        Load Sample Demo Data
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">
                        Populate starter expenses for testing
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* About Numi App Section */}
          <div className="pt-2 pb-4 flex flex-col items-center justify-center text-center">
            <NumiLogo variant="icon" size={54} className="mb-2.5" />
            <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
              Numi - Minimal Expense & Tag Tracker
            </h3>
            <p className="text-xs text-[#86868B] max-w-xs mt-1">
              Frictionless expense recording, custom tagging, and visual clarity.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5E5EA] text-[#636366]">
                v1.0.0
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#9EE42A]/20 text-[#3F6212] border border-[#9EE42A]/30">
                Official Release
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Pop-up Window Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="warning-popup-title"
          aria-describedby="warning-popup-desc"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Warning Shield & Alert Icon */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#FF3B30]/15 animate-ping opacity-75" />
              <div className="relative w-14 h-14 rounded-full bg-[#FF3B30]/15 border-2 border-[#FF3B30]/30 text-[#FF3B30] flex items-center justify-center shadow-inner">
                <AlertTriangle size={28} strokeWidth={2.2} />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3
                id="warning-popup-title"
                className="text-lg font-bold text-[#1D1D1F] tracking-tight"
              >
                Delete All Transactions?
              </h3>
              <p
                id="warning-popup-desc"
                className="text-xs sm:text-sm text-[#48484A] leading-relaxed"
              >
                Warning: By confirming this window, you will delete all{' '}
                <span className="font-semibold text-[#1D1D1F]">
                  {transactions.length} transaction(s)
                </span>{' '}
                and make everything erased. All figures and financial metrics will be set completely to zero (0).
              </p>
            </div>

            {/* Impact Details Box */}
            <div className="p-3.5 bg-[#FF3B30]/5 rounded-2xl border border-[#FF3B30]/15 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#86868B]">Transactions:</span>
                <span className="font-bold text-[#FF3B30]">
                  {transactions.length} → 0 records
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#86868B]">Balances & Spend:</span>
                <span className="font-bold text-[#1D1D1F]">Reset to 0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#86868B]">Data Persistence:</span>
                <span className="font-bold text-[#D70015]">Permanently Deleted</span>
              </div>
            </div>

            <p className="text-[11px] font-medium text-[#8E8E93] italic">
              This action cannot be undone. Your transactions will remain deleted.
            </p>

            {/* Warning Window Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  warning();
                  onDeleteAllData();
                  setShowWarningModal(false);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#FF3B30] hover:bg-[#E0261C] active:bg-[#C91F16] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Delete Everything & Reset to Zero</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setShowWarningModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#E5E5EA] hover:bg-[#D8D8DC] text-[#1D1D1F] font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel & Keep My Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
