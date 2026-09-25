import React from 'react';
import { CurrencyConfig, TimeFilter } from '../types/finance';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface OverviewCardProps {
  income: number;
  expense: number;
  currency: CurrencyConfig;
  monthlyBudget: number;
  onOpenAnalytics: () => void;
  timeFilter?: TimeFilter;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  income,
  expense,
  currency,
  monthlyBudget,
  onOpenAnalytics,
  timeFilter = 'this-month',
}) => {
  const { tap } = useHaptics();
  const netBalance = income - expense;
  const budgetPct = monthlyBudget > 0 ? (expense / monthlyBudget) * 100 : 0;
  const isBudgetWarning = budgetPct > 90;

  const filterLabel =
    timeFilter === 'this-month'
      ? 'This Month'
      : timeFilter === 'last-30-days'
      ? 'Last 30 Days'
      : 'All Time';

  const handleInsightsClick = () => {
    tap('light');
    onOpenAnalytics();
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#E0E2EC] space-y-3.5 sm:space-y-5 transition-all">
      {/* Top row: Net Cash Flow with Material 3 Chip */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[12px] sm:text-[13px] font-medium text-[#444746] tracking-tight">
              Net Balance
            </span>
            <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-[#D3E3FD] text-[#041E49] rounded-full">
              {filterLabel}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1F1F] tabular-nums truncate">
            {netBalance >= 0 ? '+' : ''}
            {formatCurrency(netBalance, currency, { signDisplay: 'never' })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleInsightsClick}
          className="w-9 h-9 rounded-full bg-[#F0F4F9] hover:bg-[#E0E2EC] flex items-center justify-center text-[#444746] hover:text-[#1F1F1F] transition-all active:scale-95 shrink-0 cursor-pointer"
          aria-label="View financial insights"
          title="View detailed insights"
        >
          <ChevronRight size={19} strokeWidth={2.2} />
        </button>
      </div>

      {/* Middle row: Inflow vs Outflow MD3 Surface Containers */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        <div className="p-3 sm:p-3.5 bg-[#F0F4F9] rounded-2xl border border-[#E0E2EC]/70 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-[#444746] mb-0.5">
            <div className="w-5 h-5 rounded-full bg-[#146C2E]/15 flex items-center justify-center text-[#146C2E] shrink-0">
              <ArrowDownLeft size={12} strokeWidth={2.5} />
            </div>
            <span className="truncate">Income</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg font-bold tabular-nums text-[#146C2E] tracking-tight truncate">
            +{formatCurrency(income, currency, { signDisplay: 'never' })}
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-[#F0F4F9] rounded-2xl border border-[#E0E2EC]/70 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-[#444746] mb-0.5">
            <div className="w-5 h-5 rounded-full bg-[#B3261E]/15 flex items-center justify-center text-[#B3261E] shrink-0">
              <ArrowUpRight size={12} strokeWidth={2.5} />
            </div>
            <span className="truncate">Spending</span>
          </div>
          <div className="text-sm sm:text-base lg:text-lg font-bold tabular-nums text-[#B3261E] tracking-tight truncate">
            -{formatCurrency(expense, currency, { signDisplay: 'never' })}
          </div>
        </div>
      </div>

      {/* Bottom Material 3 Linear Progress Indicator */}
      {monthlyBudget > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs tracking-tight flex-wrap gap-1">
            <span className="text-[#444746]">
              Monthly Limit: <span className="text-[#1F1F1F] font-semibold">{formatCurrency(monthlyBudget, currency)}</span>
            </span>
            <span className={`font-semibold ${isBudgetWarning ? 'text-[#B3261E]' : 'text-[#444746]'}`}>
              {formatPercentage(budgetPct)} spent
            </span>
          </div>
          <div className="w-full h-2 bg-[#E0E2EC] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                budgetPct > 100
                  ? 'bg-[#B3261E]'
                  : isBudgetWarning
                  ? 'bg-[#E37400]'
                  : 'bg-[#0B57D0]'
              }`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
