import React from 'react';
import { ActiveTab, TimeFilter, CurrencyConfig } from '../types/finance';
import { Settings, Plus, CreditCard, Tag, ChartPie } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { NumiLogo } from './NumiLogo';

interface HeaderProps {
  activeTab: ActiveTab;
  timeFilter: TimeFilter;
  onTimeFilterChange: (tf: TimeFilter) => void;
  onOpenSettings: () => void;
  currency?: CurrencyConfig;
  onTabChange?: (tab: ActiveTab) => void;
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  timeFilter,
  onTimeFilterChange,
  onOpenSettings,
  currency,
  onTabChange,
  onOpenAddModal,
}) => {
  const { tap } = useHaptics();
  const currentSymbol = currency?.symbol || '₹';
  const currentCode = currency?.code || 'INR';

  const handleTimeClick = (tf: TimeFilter) => {
    tap('light');
    onTimeFilterChange(tf);
  };

  const handleSettingsClick = () => {
    tap('light');
    onOpenSettings();
  };

  const handleAddClick = () => {
    tap('medium');
    if (onOpenAddModal) onOpenAddModal();
  };

  const handleTabClick = (tab: ActiveTab) => {
    tap('light');
    if (onTabChange) onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F2F2F7]/95 dark:bg-black/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
        {/* Top/Left Row: Brand, Currency Badge, and Mobile Action Icons */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <NumiLogo
              variant="brand"
              size="sm"
              subtitle="Minimal Expense & Tag Tracker"
            />

            {/* Currency Pill - Interactive badge showing ₹ INR */}
            <button
              type="button"
              onClick={handleSettingsClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1D1D1F] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] dark:text-white rounded-full transition-all active:scale-95 cursor-pointer shadow-2xs border border-black/[0.04] dark:border-white/[0.08]"
              title="Default Currency: ₹ INR (Tap to change)"
            >
              <span className="text-sm font-bold text-[#007AFF] dark:text-[#0A84FF]">{currentSymbol}</span>
              <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white">{currentCode}</span>
            </button>
          </div>

          {/* Desktop Navigation Tabs (Visible on Tablet/Desktop) */}
          {onTabChange && (
            <nav className="hidden md:flex items-center p-1 bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-full text-xs font-semibold shadow-inner border border-transparent dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleTabClick('ledger')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all min-h-[30px] cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:bg-[#2C2C2E] dark:text-white dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
                }`}
              >
                <CreditCard size={15} strokeWidth={2} />
                <span>Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabClick('tags')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all min-h-[30px] cursor-pointer ${
                  activeTab === 'tags'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:bg-[#2C2C2E] dark:text-white dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
                }`}
              >
                <Tag size={15} strokeWidth={2} />
                <span>Tags</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabClick('analytics')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all min-h-[30px] cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:bg-[#2C2C2E] dark:text-white dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
                }`}
              >
                <ChartPie size={15} strokeWidth={2} />
                <span>Insights</span>
              </button>
            </nav>
          )}

          {/* Mobile Right Action Icons (New Transaction + Settings) */}
          <div className="flex md:hidden items-center gap-1.5">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={handleAddClick}
                className="w-8 h-8 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label="Add transaction"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSettingsClick}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-black/[0.04] dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Center / Right Row: Apple Time Filter Segmented Control */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 sm:gap-3">
          <div className="flex-1 md:flex-initial flex items-center p-0.5 sm:p-1 bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-full text-xs shadow-inner border border-transparent dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => handleTimeClick('this-month')}
              className={`flex-1 md:flex-initial px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 min-h-[30px] sm:min-h-[28px] cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                timeFilter === 'this-month'
                  ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] dark:bg-[#2C2C2E] dark:text-white dark:ring-white/[0.08] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <span>This Month</span>
            </button>
            <button
              type="button"
              onClick={() => handleTimeClick('last-30-days')}
              className={`flex-1 md:flex-initial px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 min-h-[30px] sm:min-h-[28px] cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                timeFilter === 'last-30-days'
                  ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] dark:bg-[#2C2C2E] dark:text-white dark:ring-white/[0.08] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <span>Last 30 Days</span>
            </button>
            <button
              type="button"
              onClick={() => handleTimeClick('all-time')}
              className={`flex-1 md:flex-initial px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 min-h-[30px] sm:min-h-[28px] cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                timeFilter === 'all-time'
                  ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] dark:bg-[#2C2C2E] dark:text-white dark:ring-white/[0.08] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  : 'text-[#636366] hover:text-[#1D1D1F] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              <span>All Time</span>
            </button>
          </div>

          {/* Desktop Right Actions: + Add Button & Settings */}
          <div className="hidden md:flex items-center gap-2">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={handleAddClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(0,122,255,0.25)] active:scale-95 transition-all cursor-pointer min-h-[32px]"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>New Transaction</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSettingsClick}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-black/[0.04] dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors cursor-pointer active:scale-95"
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

