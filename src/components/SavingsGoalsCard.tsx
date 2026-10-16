import React from 'react';
import { SavingsGoal, CurrencyConfig } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { PiggyBank, Plus, Edit2, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface SavingsGoalsCardProps {
  goals: SavingsGoal[];
  currency: CurrencyConfig;
  onOpenNewGoalModal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onAddSavingsForGoal: (goal: SavingsGoal) => void;
}

export const SavingsGoalsCard: React.FC<SavingsGoalsCardProps> = ({
  goals,
  currency,
  onOpenNewGoalModal,
  onEditGoal,
  onAddSavingsForGoal,
}) => {
  const { tap } = useHaptics();

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="w-full bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-xs border border-[#E0E2EC] dark:border-white/[0.08] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#9EE42A]/20 dark:bg-[#9EE42A]/25 text-[#3F6212] dark:text-[#9EE42A] flex items-center justify-center shrink-0">
            <PiggyBank size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Savings Targets</span>
              {goals.length > 0 && (
                <span className="text-[11px] font-semibold text-[#86868B] dark:text-[#8E8E93]">
                  ({goals.length})
                </span>
              )}
            </h3>
            <p className="text-[11px] font-medium text-[#86868B] dark:text-[#8E8E93]">
              {goals.length === 0
                ? 'Create goals to track capital accumulation'
                : `${formatCurrency(totalSaved, currency)} saved across goals`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            tap('light');
            onOpenNewGoalModal();
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus size={13} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Overall Progress Mini Bar if goals exist */}
      {goals.length > 0 && totalTarget > 0 && (
        <div className="p-3.5 mb-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1D1D1F] dark:text-white">Overall Milestone</span>
            <span className="font-bold text-[#146C2E] dark:text-[#9EE42A] tabular-nums">
              {overallPercentage}% ({formatCurrency(totalSaved, currency)} / {formatCurrency(totalTarget, currency)})
            </span>
          </div>
          <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9EE42A] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(158,228,42,0.4)]"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-2xl bg-[#F8F9FA] dark:bg-[#252528] border border-dashed border-[#E0E2EC] dark:border-white/10 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#9EE42A]/15 text-[#3F6212] dark:text-[#9EE42A] flex items-center justify-center">
            <Target size={20} />
          </div>
          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
            No savings targets yet
          </p>
          <p className="text-[11px] text-[#86868B] dark:text-[#8E8E93] max-w-xs mx-auto">
            Set targets like an Emergency Fund, Vacation, or Tech Upgrade to budget intentionally.
          </p>
          <button
            type="button"
            onClick={() => {
              tap('medium');
              onOpenNewGoalModal();
            }}
            className="mt-2 text-xs font-semibold px-4 py-2 rounded-full bg-[#007AFF] text-white hover:bg-[#0071E3] cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0;
            const goalAccent = goal.color || '#9EE42A';

            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-[#252528] border border-[#E0E2EC] dark:border-white/[0.06] hover:border-[#007AFF]/30 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: goalAccent }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">
                          {goal.name}
                        </h4>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#146C2E] dark:text-[#30D158]">
                            <CheckCircle2 size={12} />
                            <span>Reached</span>
                          </span>
                        )}
                      </div>
                      {goal.targetDate && (
                        <p className="text-[10px] text-[#86868B] dark:text-[#8E8E93]">
                          Target: {goal.targetDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        tap('light');
                        onAddSavingsForGoal(goal);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#9EE42A]/25 hover:bg-[#9EE42A]/35 text-[#274008] dark:text-[#A3E635] flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                      title="Add savings to this goal"
                    >
                      <Plus size={11} />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        tap('light');
                        onEditGoal(goal);
                      }}
                      className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit target"
                      aria-label={`Edit ${goal.name}`}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: goalAccent,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#86868B] dark:text-[#8E8E93]">
                    <span className="font-semibold text-[#1D1D1F] dark:text-white tabular-nums">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="tabular-nums">
                      {pct}% of {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
