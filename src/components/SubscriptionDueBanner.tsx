import React from 'react';
import { Subscription, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { Repeat, Check, X, Calendar } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface SubscriptionDueBannerProps {
  subscriptions: Subscription[];
  currency: CurrencyConfig;
  onLogPayment: (sub: Subscription) => void;
  onDismissReminder: (subId: string) => void;
  onOpenSubscriptions: () => void;
}

export const SubscriptionDueBanner: React.FC<SubscriptionDueBannerProps> = ({
  subscriptions,
  currency,
  onLogPayment,
  onDismissReminder,
  onOpenSubscriptions,
}) => {
  const { tap, success } = useHaptics();

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${currentMonthYear}-${String(currentDay).padStart(2, '0')}`;

  // Find active subscriptions that are due today or around now, and haven't been logged or dismissed this month
  const dueSubscriptions = subscriptions.filter((sub) => {
    if (sub.status !== 'active') return false;
    if (sub.reminderDismissedMonth === currentMonthYear) return false;
    if (sub.lastLoggedDate && sub.lastLoggedDate.startsWith(currentMonthYear)) return false;

    // Check if billing day is today or within ±1 day or overdue for current month
    return sub.billingDay <= currentDay;
  });

  if (dueSubscriptions.length === 0) return null;

  const activeDueSub = dueSubscriptions[0];
  const isDueToday = activeDueSub.billingDay === currentDay;
  const isOverdue = activeDueSub.billingDay < currentDay;

  return (
    <aside
      aria-label="Recurring Subscription Payment Due Alert"
      className="w-full mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#5856D6]/15 via-[#AF52DE]/10 to-[#5856D6]/15 dark:from-[#5856D6]/25 dark:via-[#AF52DE]/15 dark:to-[#5856D6]/25 border border-[#5856D6]/30 dark:border-[#AF52DE]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#5856D6] dark:bg-[#AF52DE] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Repeat size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#5856D6]/20 text-[#5856D6] dark:text-[#D1A4FF]">
              {isDueToday ? 'Renewal Due Today' : isOverdue ? 'Renewal Due This Month' : 'Upcoming Renewal'}
            </span>
            {dueSubscriptions.length > 1 && (
              <span className="text-[11px] font-semibold text-[#86868B] dark:text-[#8E8E93]">
                +{dueSubscriptions.length - 1} more
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-[#1D1D1F] dark:text-white mt-0.5 truncate">
            {activeDueSub.name} •{' '}
            <span className="text-[#5856D6] dark:text-[#D1A4FF] tabular-nums">
              {formatCurrency(activeDueSub.amount, currency)}
            </span>
          </p>
          <p className="text-[11px] text-[#48484A] dark:text-[#A1A1A6]">
            Recurring subscription on day {activeDueSub.billingDay} of every month.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        <button
          type="button"
          onClick={() => {
            success();
            onLogPayment(activeDueSub);
          }}
          className="flex-1 sm:flex-none py-2 px-3.5 rounded-full bg-[#5856D6] hover:bg-[#4845B4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Check size={14} />
          <span>Log Payment</span>
        </button>

        <button
          type="button"
          onClick={() => {
            tap('light');
            onDismissReminder(activeDueSub.id);
          }}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#86868B] dark:text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white transition-colors cursor-pointer"
          title="Dismiss reminder for this month"
          aria-label="Dismiss reminder"
        >
          <X size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            tap('light');
            onOpenSubscriptions();
          }}
          className="hidden md:inline-flex text-xs font-medium text-[#5856D6] dark:text-[#D1A4FF] hover:underline px-2 py-1 cursor-pointer"
        >
          View All
        </button>
      </div>
    </aside>
  );
};
