import React from 'react';
import { ActiveTab } from '../types/finance';
import { CreditCard, Tag, ChartPie, Plus } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-black/[0.08] pb-[env(safe-area-inset-bottom,0px)] md:hidden transition-all">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-around relative">

        {/* Tab 1: Ledger / Wallet */}
        <button
          type="button"
          onClick={() => handleTabClick('ledger')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'ledger'
              ? 'text-[#007AFF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F]'
          }`}
        >
          <CreditCard size={20} strokeWidth={activeTab === 'ledger' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Wallet</span>
        </button>

        {/* Center Primary Action Button (Apple iOS Add Pill) */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-11 h-11 rounded-full bg-[#007AFF] hover:bg-[#0071E3] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-95 transition-all -translate-y-1.5 cursor-pointer"
            aria-label="Add transaction"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tab 2: Custom Tags */}
        <button
          type="button"
          onClick={() => handleTabClick('tags')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'tags'
              ? 'text-[#007AFF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F]'
          }`}
        >
          <Tag size={20} strokeWidth={activeTab === 'tags' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Tags</span>
        </button>

        {/* Tab 3: Insights & Analytics */}
        <button
          type="button"
          onClick={() => handleTabClick('analytics')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'analytics'
              ? 'text-[#007AFF]'
              : 'text-[#8E8E93] hover:text-[#1D1D1F]'
          }`}
        >
          <ChartPie size={20} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Insights</span>
        </button>
      </div>
    </div>
  );
};
