import React, { useState } from 'react';
import {
  LayoutGrid,
  X,
  Plus,
  Smartphone,
  Apple,
  Check,
  Copy,
  Sparkles,
  TrendingDown,
  Calendar,
  Layers,
  Lock,
  Flame,
  Info,
} from 'lucide-react';
import { Transaction, BudgetConfig, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useHaptics } from '../hooks/useHaptics';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';

interface WidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budget: BudgetConfig;
  currency: CurrencyConfig;
  onOpenAddModal: () => void;
}

type WidgetSize = 'small' | 'medium' | 'ledger' | 'lockscreen';
type WidgetTheme = 'system' | 'midnight' | 'lime' | 'aurora';
type PlatformGuide = 'ios' | 'android';

export const WidgetsModal: React.FC<WidgetsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budget,
  currency,
  onOpenAddModal,
}) => {
  const { tap, success } = useHaptics();
  const { isInstallable, install } = usePWAInstall();

  const [selectedSize, setSelectedSize] = useState<WidgetSize>('small');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('system');
  const [platform, setPlatform] = useState<PlatformGuide>('ios');
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  if (!isOpen) return null;

  // Real data calculations
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const todayExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date === todayStr
  );
  const todaySpent = todayExpenses.reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
  );
  const monthSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const budgetLimit = budget.monthlyLimit;
  const remainingBudget = Math.max(0, budgetLimit - monthSpent);
  const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((monthSpent / budgetLimit) * 100)) : 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailyAllowance = Math.round(remainingBudget / daysLeft);

  const recentExpenses = transactions.slice(0, 3);

  const quickAddUrl = typeof window !== 'undefined' ? `${window.location.origin}/?action=quick-add` : 'https://numi.app/?action=quick-add';

  const handleCopyShortcutUrl = () => {
    tap('light');
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(quickAddUrl);
      setCopiedShortcut(true);
      success();
      setTimeout(() => setCopiedShortcut(false), 3000);
    }
  };

  const handleTestQuickAdd = () => {
    tap('medium');
    onClose();
    onOpenAddModal();
  };

  // Theme styles for widget preview
  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'midnight':
        return 'bg-[#0D0D0E] text-white border-white/[0.12] shadow-2xl';
      case 'lime':
        return 'bg-[#18230F] text-[#E8FFA6] border-[#9EE42A]/40 shadow-2xl';
      case 'aurora':
        return 'bg-gradient-to-br from-[#1C1C36] via-[#121226] to-[#0A0A16] text-white border-indigo-500/30 shadow-2xl';
      case 'system':
      default:
        return 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white border-black/[0.08] dark:border-white/[0.08] shadow-xl';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#9EE42A]/20 dark:bg-[#9EE42A]/25 text-[#3F6212] dark:text-[#9EE42A] flex items-center justify-center">
              <LayoutGrid size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight flex items-center gap-2">
                Mobile Home Screen Widgets
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]">
                  iOS & Android
                </span>
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Live glanceable finance widgets for your phone's home screen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Widget Size Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                1. Select Widget Format
              </label>
              <span className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] font-medium">
                Live interactive preview
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setSelectedSize('small');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSize === 'small'
                    ? 'border-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-[#1D1D1F] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Smartphone size={14} />
                  <span>Small 2x2</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Today's Spend & Quick Add</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setSelectedSize('medium');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSize === 'medium'
                    ? 'border-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-[#1D1D1F] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Layers size={14} />
                  <span>Medium 4x2</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Budget & Burn Rate</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setSelectedSize('ledger');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSize === 'ledger'
                    ? 'border-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-[#1D1D1F] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <TrendingDown size={14} />
                  <span>Ledger 4x2</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Recent Expenses</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setSelectedSize('lockscreen');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedSize === 'lockscreen'
                    ? 'border-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                    : 'border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-[#1D1D1F] dark:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Lock size={14} />
                  <span>Lock Screen</span>
                </div>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Minimalist Pill Glance</p>
              </button>
            </div>
          </div>

          {/* Section 2: Interactive Live Widget Simulator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                2. Live Home Screen Widget
              </label>

              {/* Theme Selector for Widget */}
              <div className="flex items-center gap-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedTheme('system')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                    selectedTheme === 'system' ? 'bg-white dark:bg-[#1C1C1E] shadow-2xs text-[#1D1D1F] dark:text-white' : 'text-[#8E8E93]'
                  }`}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('midnight')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                    selectedTheme === 'midnight' ? 'bg-black text-white shadow-2xs' : 'text-[#8E8E93]'
                  }`}
                >
                  OLED
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('lime')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                    selectedTheme === 'lime' ? 'bg-[#9EE42A] text-black shadow-2xs' : 'text-[#8E8E93]'
                  }`}
                >
                  Lime
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme('aurora')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                    selectedTheme === 'aurora' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-[#8E8E93]'
                  }`}
                >
                  Aurora
                </button>
              </div>
            </div>

            {/* Simulated Phone Wallpaper Background Container */}
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2C3E50]/40 via-[#000000]/60 to-[#000000]/80 border border-black/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden min-h-[220px]">
              {/* Wallpaper blur aesthetic elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#9EE42A]/20 rounded-full blur-3xl pointer-events-none" />

              {/* 1. Small 2x2 Widget */}
              {selectedSize === 'small' && (
                <div
                  className={`w-44 h-44 rounded-3xl p-4 flex flex-col justify-between border transition-all duration-300 relative group ${getThemeClasses()}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight opacity-75">
                        <Calendar size={13} />
                        <span>
                          {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" title="Live Sync Active" />
                    </div>

                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium opacity-60 uppercase tracking-wider block">
                        Today's Spend
                      </span>
                      <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                        {formatCurrency(todaySpent, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] opacity-70">
                      <span>Daily Budget</span>
                      <span className="font-semibold">{formatCurrency(dailyAllowance, currency)}/d</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestQuickAdd}
                      className="w-full py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0071E3] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.8} />
                      <span>Log Expense</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Medium 4x2 Widget */}
              {selectedSize === 'medium' && (
                <div
                  className={`w-full max-w-sm rounded-3xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-300 ${getThemeClasses()}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center font-bold text-xs">
                        {currency.symbol}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">
                          {now.toLocaleDateString([], { month: 'long' })} Budget
                        </h4>
                        <p className="text-[10px] opacity-60">
                          {daysLeft} days remaining
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestQuickAdd}
                      className="px-2.5 py-1 rounded-xl bg-[#007AFF] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:bg-[#0071E3] active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      <span>Quick Add</span>
                    </button>
                  </div>

                  {/* Progress and numbers */}
                  <div className="my-2.5 space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-xl font-extrabold tracking-tight">
                          {formatCurrency(monthSpent, currency)}
                        </span>
                        <span className="text-[11px] opacity-60 ml-1">
                          / {formatCurrency(budgetLimit, currency)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#34C759]">
                        {formatCurrency(remainingBudget, currency)} left
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          budgetPercent > 90 ? 'bg-[#FF3B30]' : budgetPercent > 70 ? 'bg-[#FF9500]' : 'bg-[#34C759]'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/[0.06] dark:border-white/[0.06] opacity-80">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-[#FF9500]" />
                      Safe Daily Burn: <strong>{formatCurrency(dailyAllowance, currency)}/day</strong>
                    </span>
                    <span className="text-[10px] font-bold opacity-75">{budgetPercent}% spent</span>
                  </div>
                </div>
              )}

              {/* 3. Ledger 4x2 Widget */}
              {selectedSize === 'ledger' && (
                <div
                  className={`w-full max-w-sm rounded-3xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-300 ${getThemeClasses()}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-tight">Recent Ledger</span>
                    <button
                      type="button"
                      onClick={handleTestQuickAdd}
                      className="px-2 py-0.5 rounded-lg bg-[#007AFF] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {recentExpenses.length > 0 ? (
                      recentExpenses.map((tx) => {
                        const cat =
                          DEFAULT_CATEGORIES.find((c) => c.id === tx.category || c.name === tx.category) ||
                          DEFAULT_CATEGORIES[11];
                        return (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CategoryIcon iconName={cat.iconName} size={15} />
                              <span className="truncate font-semibold">{tx.title}</span>
                            </div>
                            <span
                              className={`font-bold shrink-0 ml-2 ${
                                tx.type === 'expense' ? 'text-[#FF3B30] dark:text-[#FF453A]' : 'text-[#34C759]'
                              }`}
                            >
                              {tx.type === 'expense' ? '-' : '+'}
                              {formatCurrency(tx.amount, currency)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-xs opacity-50">No recent transactions recorded</div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Lock Screen Widget */}
              {selectedSize === 'lockscreen' && (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    iPhone Lock Screen Style (Inline & Rectangular)
                  </span>
                  <div className="px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {currency.symbol}
                    </div>
                    <div>
                      <p className="text-xs font-bold">
                        {formatCurrency(todaySpent, currency)} spent today
                      </p>
                      <p className="text-[10px] text-white/70">
                        {formatCurrency(remainingBudget, currency)} left • {daysLeft}d left
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-[#8E8E93]">
              <span className="flex items-center gap-1">
                <Info size={13} />
                Live data updates in real-time as transactions are recorded.
              </span>
              <button
                type="button"
                onClick={handleTestQuickAdd}
                className="font-bold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
              >
                Test + Quick Log Now →
              </button>
            </div>
          </div>

          {/* Section 3: Step-by-Step Add to Home Screen Instructions */}
          <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                3. How to Add to Your Phone's Home Screen
              </label>

              {/* Platform Switcher */}
              <div className="flex items-center bg-[#F2F2F7] dark:bg-[#2C2C2E] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    tap('light');
                    setPlatform('ios');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    platform === 'ios'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                      : 'text-[#8E8E93]'
                  }`}
                >
                  <Apple size={13} />
                  <span>iPhone / iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tap('light');
                    setPlatform('android');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    platform === 'android'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                      : 'text-[#8E8E93]'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Android</span>
                </button>
              </div>
            </div>

            {/* iOS Instructions */}
            {platform === 'ios' && (
              <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.04] space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Open in Safari</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Add to Home Screen</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Scroll down and tap <strong>"Add to Home Screen"</strong> with the [+] icon.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Long Press for Widgets</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Touch & hold the Numi app icon on your home screen to instantly access Quick-Add shortcuts!
                    </p>
                  </div>
                </div>

                {/* iPhone Action Button / Shortcut Link Generator */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#007AFF]/10 to-[#5856D6]/10 border border-[#007AFF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <p className="text-xs font-bold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#007AFF]" />
                      iPhone Action Button & Shortcuts URL
                    </p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Bind this direct URL to your iPhone 15/16 Action Button or Back Tap for instant 1-second logging.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyShortcutUrl}
                    className="px-3 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#0071E3] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedShortcut ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedShortcut ? 'Copied!' : 'Copy Action URL'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {platform === 'android' && (
              <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.04] space-y-3.5">
                {/* One Tap Install Button if supported */}
                {isInstallable && (
                  <div className="p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                        One-Tap Home Screen Setup Ready
                      </p>
                      <p className="text-[11px] text-[#8E8E93]">
                        Add Numi directly to your Android launcher with home screen shortcuts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        tap('medium');
                        await install();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#34C759] text-white text-xs font-bold shadow-md hover:bg-[#2DB34E] active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      Install Widget App
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Add to Home screen</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      In Chrome, tap the <strong>⋮ menu</strong> in the top right and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Long Press Icon</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Touch & hold the Numi icon on your phone's home screen to view App Shortcut widgets.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <p className="font-bold text-[#1D1D1F] dark:text-white">Pin Widget to Screen</p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Drag the <strong>"Quick Add"</strong> or <strong>"Budget"</strong> shortcut directly onto your home screen grid!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#F2F2F7] dark:bg-[#2C2C2E]/40 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleTestQuickAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Launch Quick-Add Now</span>
          </button>

          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0071E3] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
