import React, { useState } from 'react';
import { Subscription, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Edit2,
  Trash2,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  currency: CurrencyConfig;
  onOpenAddSubscription: () => void;
  onEditSubscription: (sub: Subscription) => void;
  onToggleStatus: (subId: string) => void;
  onDeleteSubscription: (subId: string) => void;
  onLogPayment: (sub: Subscription) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  currency,
  onOpenAddSubscription,
  onEditSubscription,
  onToggleStatus,
  onDeleteSubscription,
  onLogPayment,
}) => {
  const { tap, success } = useHaptics();

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((acc, s) => acc + s.amount, 0);
  const annualTotal = monthlyTotal * 12;

  // Helper to calculate days until next billing
  const getRenewalInfo = (billingDay: number) => {
    if (billingDay === currentDay) {
      return { text: 'Renews Today', isToday: true, isUpcoming: true, days: 0 };
    }
    if (billingDay > currentDay) {
      const diff = billingDay - currentDay;
      return {
        text: `In ${diff} day${diff === 1 ? '' : 's'} (${billingDay}th)`,
        isToday: false,
        isUpcoming: diff <= 5,
        days: diff,
      };
    }
    // Days in current month for rollover calculation
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const diff = daysInMonth - currentDay + billingDay;
    return {
      text: `Next month (${billingDay}th)`,
      isToday: false,
      isUpcoming: false,
      days: diff,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Run Rate */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#5856D6]/15 dark:bg-[#5856D6]/25 text-[#5856D6] dark:text-[#D1A4FF] flex items-center justify-center shrink-0">
            <Repeat size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93] block">
              Monthly Fixed Cost
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] dark:text-white tabular-nums tracking-tight">
              {formatCurrency(monthlyTotal, currency)}
            </span>
            <span className="text-[11px] text-[#86868B] dark:text-[#8E8E93] block">
              Across {activeSubs.length} active service{activeSubs.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Projected Annual Spend */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#007AFF]/15 dark:bg-[#0A84FF]/25 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93] block">
              Projected Annual Total
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] dark:text-white tabular-nums tracking-tight">
              {formatCurrency(annualTotal, currency)}
            </span>
            <span className="text-[11px] text-[#86868B] dark:text-[#8E8E93] block">
              12-month commitment
            </span>
          </div>
        </div>

        {/* Action Header Strip */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#8E8E93]">
              Subscriptions Hub
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#146C2E] dark:text-[#30D158]">
              {subscriptions.length} Total
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              tap('medium');
              onOpenAddSubscription();
            }}
            className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-[#5856D6] hover:bg-[#4845B4] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all"
          >
            <Plus size={15} />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Subscription Timeline & Management Feed */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-2">
              <Calendar size={18} className="text-[#5856D6]" />
              <span>Recurring Subscriptions & Renewals</span>
            </h3>
            <p className="text-xs text-[#86868B] dark:text-[#8E8E93] mt-0.5">
              Every month on each service's billing day, you'll receive a renewal reminder to log the expense.
            </p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#F8F9FA] dark:bg-[#252528] border border-dashed border-[#E0E2EC] dark:border-white/10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#5856D6]/15 text-[#5856D6] dark:text-[#D1A4FF] flex items-center justify-center">
              <Repeat size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white">
              No subscriptions registered
            </h4>
            <p className="text-xs text-[#86868B] dark:text-[#8E8E93] max-w-sm mx-auto">
              Add your monthly recurring costs like streaming, utilities, gym, or software to track your burn rate and never miss a renewal.
            </p>
            <button
              type="button"
              onClick={() => {
                tap('medium');
                onOpenAddSubscription();
              }}
              className="mt-2 text-xs font-semibold px-5 py-2.5 rounded-full bg-[#5856D6] text-white hover:bg-[#4845B4] cursor-pointer shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Your First Subscription</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E2EC]/70 dark:divide-white/[0.06]">
            {subscriptions.map((sub) => {
              const renewal = getRenewalInfo(sub.billingDay);
              const isLoggedThisMonth = sub.lastLoggedDate && sub.lastLoggedDate.startsWith(currentMonthYear);

              return (
                <div
                  key={sub.id}
                  className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors rounded-xl px-2"
                >
                  {/* Left: Icon & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        sub.status === 'active'
                          ? 'bg-[#5856D6]/10 text-[#5856D6] dark:bg-[#AF52DE]/20 dark:text-[#D1A4FF]'
                          : 'bg-[#8E8E93]/15 text-[#8E8E93]'
                      }`}
                    >
                      <Repeat size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">
                          {sub.name}
                        </h4>
                        {sub.status === 'paused' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FF9500]/15 text-[#FF9500]">
                            Paused
                          </span>
                        ) : isLoggedThisMonth ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#34C759]/15 text-[#146C2E] dark:text-[#30D158] flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Paid this month</span>
                          </span>
                        ) : renewal.isToday ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF3B30]/15 text-[#FF3B30] dark:text-[#FF453A] animate-pulse">
                            Due Today
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#86868B] dark:text-[#8E8E93] mt-0.5">
                        <span>{sub.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={11} />
                          <span>{renewal.text}</span>
                        </span>
                        {sub.note && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px] sm:max-w-[200px]">{sub.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Cost & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-black/[0.04] dark:border-white/[0.04]">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-[#1D1D1F] dark:text-white tabular-nums block">
                        {formatCurrency(sub.amount, currency)}
                      </span>
                      <span className="text-[10px] text-[#86868B] dark:text-[#8E8E93] block">
                        Day {sub.billingDay} each mo
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* One-tap Log Payment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          success();
                          onLogPayment(sub);
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                          isLoggedThisMonth
                            ? 'bg-black/5 dark:bg-white/10 text-[#86868B] dark:text-[#8E8E93] hover:text-[#1D1D1F]'
                            : 'bg-[#5856D6] hover:bg-[#4845B4] text-white shadow-xs'
                        }`}
                        title="Record payment for this cycle"
                      >
                        <CheckCircle2 size={13} />
                        <span>{isLoggedThisMonth ? 'Log Again' : 'Log Payment'}</span>
                      </button>

                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => {
                          tap('light');
                          onToggleStatus(sub.id);
                        }}
                        className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title={sub.status === 'active' ? 'Pause subscription' : 'Activate subscription'}
                      >
                        {sub.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          tap('light');
                          onEditSubscription(sub);
                        }}
                        className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit subscription"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
