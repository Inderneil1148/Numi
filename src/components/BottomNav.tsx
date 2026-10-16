import React from 'react';
import { ActiveTab } from '../types/finance';
import { CreditCard, Tag, ChartPie, Plus, Repeat } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  hasDueSubscriptions?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  hasDueSubscriptions = false,
}) => {
  const { tap } = useHaptics();

  const handleTabClick = (tab: ActiveTab) => {
    tap('light');
    onTabChange(tab);
  };

  const handleAddClick = () => {
    tap('medium');
    onOpenAddModal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121214]/90 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.08] pb-[env(safe-area-inset-bottom,0px)] md:hidden transition-all">
      <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around relative">
        {/* Tab 1: Ledger / Wallet */}
        <button
          type="button"
          onClick={() => handleTabClick('ledger')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'ledger'
              ? 'text-[#007AFF] dark:text-[#0A84FF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          <CreditCard size={18} strokeWidth={activeTab === 'ledger' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Wallet</span>
        </button>

        {/* Tab 2: Recurring Subscriptions */}
        <button
          type="button"
          onClick={() => handleTabClick('subscriptions')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 relative ${
            activeTab === 'subscriptions'
              ? 'text-[#5856D6] dark:text-[#D1A4FF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          <div className="relative">
            <Repeat size={18} strokeWidth={activeTab === 'subscriptions' ? 2.4 : 1.8} />
            {hasDueSubscriptions && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF3B30] ring-2 ring-white dark:ring-[#121214]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Subs</span>
        </button>

        {/* Center Primary Action Button (Add Pill) */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-10 h-10 rounded-full bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-95 transition-all -translate-y-1.5 cursor-pointer"
            aria-label="Add transaction"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tab 3: Custom Tags */}
        <button
          type="button"
          onClick={() => handleTabClick('tags')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'tags'
              ? 'text-[#007AFF] dark:text-[#0A84FF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          <Tag size={18} strokeWidth={activeTab === 'tags' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Tags</span>
        </button>

        {/* Tab 4: Insights & Analytics */}
        <button
          type="button"
          onClick={() => handleTabClick('analytics')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'analytics'
              ? 'text-[#007AFF] dark:text-[#0A84FF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
          }`}
        >
          <ChartPie size={18} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Insights</span>
        </button>
      </div>
    </div>
  );
};
