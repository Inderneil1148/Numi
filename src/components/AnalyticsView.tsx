import React, { useMemo } from 'react';
import {
  Transaction,
  Category,
  CurrencyConfig,
  BudgetConfig,
} from '../types/finance';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { ArrowDownLeft, ArrowUpRight, Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  budget: BudgetConfig;
  onEditBudget: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  currency,
  budget,
  onEditBudget,
}) => {
  const {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    categoryBreakdown,
  } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catSpendMap: Record<string, { total: number; count: number }> = {};

    categories.forEach((c) => {
      catSpendMap[c.name] = { total: 0, count: 0 };
    });

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (!catSpendMap[tx.category]) {
          catSpendMap[tx.category] = { total: 0, count: 0 };
        }
        catSpendMap[tx.category].total += tx.amount;
        catSpendMap[tx.category].count += 1;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? (net / income) * 100 : 0;

    const breakdown = categories
      .filter((c) => c.type === 'expense' || c.type === 'both')
      .map((c) => {
        const spent = catSpendMap[c.name]?.total || 0;
        const count = catSpendMap[c.name]?.count || 0;
        const pct = expense > 0 ? (spent / expense) * 100 : 0;
        return {
          ...c,
          spent,
          count,
          percentage: pct,
        };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      savingsRate: Math.max(-100, Math.min(100, rate)),
      categoryBreakdown: breakdown,
    };
  }, [transactions, categories]);

  const budgetProgress =
    budget.monthlyLimit > 0
      ? (totalExpense / budget.monthlyLimit) * 100
      : 0;
  const remainingBudget = budget.monthlyLimit - totalExpense;
  const isOverBudget = remainingBudget < 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 4-Stat Metric Row in Material Design 3 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {/* Income Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 sm:p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-1 min-w-0 transition-colors">
          <div className="flex items-center justify-between text-[#444746] dark:text-[#8E8E93]">
            <span className="text-[11px] sm:text-xs font-medium truncate">Income</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#146C2E]/15 dark:bg-[#30D158]/20 flex items-center justify-center text-[#146C2E] dark:text-[#30D158] shrink-0">
              <ArrowDownLeft size={12} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold tracking-tight text-[#146C2E] dark:text-[#30D158] tabular-nums truncate">
            +{formatCurrency(totalIncome, currency, { signDisplay: 'never' })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#747775] dark:text-[#8E8E93]">Total earned</p>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 sm:p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-1 min-w-0 transition-colors">
          <div className="flex items-center justify-between text-[#444746] dark:text-[#8E8E93]">
            <span className="text-[11px] sm:text-xs font-medium truncate">Spending</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#B3261E]/15 dark:bg-[#FF453A]/20 flex items-center justify-center text-[#B3261E] dark:text-[#FF453A] shrink-0">
              <ArrowUpRight size={12} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold tracking-tight text-[#B3261E] dark:text-[#FF453A] tabular-nums truncate">
            -{formatCurrency(totalExpense, currency, { signDisplay: 'never' })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#747775] dark:text-[#8E8E93]">Total spent</p>
        </div>

        {/* Net Cash Flow Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 sm:p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-1 min-w-0 transition-colors">
          <div className="flex items-center justify-between text-[#444746] dark:text-[#8E8E93]">
            <span className="text-[11px] sm:text-xs font-medium truncate">Net Flow</span>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${netSavings >= 0 ? 'bg-[#E7F8ED] text-[#146C2E] dark:bg-[#30D158]/20 dark:text-[#30D158]' : 'bg-[#F9DEDC] text-[#B3261E] dark:bg-[#FF453A]/20 dark:text-[#FF453A]'}`}>
              {netSavings >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold tracking-tight text-[#1F1F1F] dark:text-white tabular-nums truncate">
            {netSavings >= 0 ? '+' : ''}
            {formatCurrency(netSavings, currency, { signDisplay: 'never' })}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#747775] dark:text-[#8E8E93]">Period balance</p>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-3 sm:p-4 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-1 min-w-0 transition-colors">
          <div className="flex items-center justify-between text-[#444746] dark:text-[#8E8E93]">
            <span className="text-[11px] sm:text-xs font-medium truncate">Savings Rate</span>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#D3E3FD] text-[#041E49] dark:bg-[#0A84FF]/20 dark:text-[#64D2FF] shrink-0">
              Rate
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold tracking-tight text-[#007AFF] dark:text-[#0A84FF] tabular-nums truncate">
            {formatPercentage(savingsRate)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#747775] dark:text-[#8E8E93]">Retained income</p>
        </div>
      </div>

      {/* Main Split: Left Column (Budget & Pacing), Right Column (Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Budget Tracker Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF] flex items-center justify-center">
                  <Target size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F1F1F] dark:text-white">
                    Monthly Budget Target
                  </h3>
                  <p className="text-[11px] text-[#747775] dark:text-[#8E8E93]">
                    Pacing and monthly limit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onEditBudget}
                className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#E8F0FE] dark:hover:bg-white/[0.08] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
              >
                Edit Limit
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-[#444746] dark:text-[#8E8E93]">
                  Spent so far:
                </span>
                <span className="text-base font-bold text-[#1F1F1F] dark:text-white tabular-nums">
                  {formatCurrency(totalExpense, currency)} /{' '}
                  <span className="text-xs text-[#747775] dark:text-[#8E8E93] font-normal">
                    {formatCurrency(budget.monthlyLimit, currency)}
                  </span>
                </span>
              </div>

              {/* Material 3 Linear Progress Bar */}
              <div className="w-full h-2.5 bg-[#E0E2EC] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetProgress > 100
                      ? 'bg-[#B3261E] dark:bg-[#FF453A]'
                      : budgetProgress > 85
                      ? 'bg-[#E37400] dark:bg-[#FF9F0A]'
                      : 'bg-[#007AFF] dark:bg-[#0A84FF]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, budgetProgress))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs tracking-tight">
                <span className="text-[#444746] dark:text-[#8E8E93] font-medium">
                  {formatPercentage(budgetProgress)} used
                </span>
                <div className="flex items-center gap-1">
                  {isOverBudget ? (
                    <span className="text-[#B3261E] dark:text-[#FF453A] flex items-center gap-1 font-semibold">
                      <AlertCircle size={14} strokeWidth={2.5} />
                      <span>
                        Over by {formatCurrency(Math.abs(remainingBudget), currency)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#146C2E] dark:text-[#30D158] flex items-center gap-1 font-semibold">
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                      <span>
                        {formatCurrency(remainingBudget, currency)} left
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Category Breakdown */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-3 text-[12px] font-semibold text-[#444746] dark:text-[#8E8E93] tracking-tight uppercase">
            <span>Spend by Category</span>
            <span className="normal-case text-[11px] text-[#747775] dark:text-[#8E8E93] font-normal">{categoryBreakdown.length} active categories</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E0E2EC] dark:border-white/[0.08] shadow-xs divide-y divide-[#E0E2EC] dark:divide-white/[0.06] overflow-hidden transition-colors">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 hover:bg-[#F0F4F9] dark:hover:bg-[#2C2C2E]/60 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon iconName={cat.iconName} size={15} />
                    </div>
                    <span className="text-xs font-semibold text-[#1F1F1F] dark:text-white truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#747775] dark:text-[#8E8E93]">
                      ({cat.count} tx)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold tabular-nums text-[#1F1F1F] dark:text-white">
                      {formatCurrency(cat.spent, currency)}
                    </span>
                    <span className="text-[11px] text-[#747775] dark:text-[#8E8E93] block">
                      {formatPercentage(cat.percentage)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#E0E2EC] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, cat.percentage))}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {categoryBreakdown.length === 0 && (
              <div className="p-6 text-center text-xs text-[#747775] dark:text-[#8E8E93]">
                No expense data recorded yet for this period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
