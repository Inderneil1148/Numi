import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Transaction,
  CustomTag,
  CurrencyConfig,
  BudgetConfig,
  ActiveTab,
  TimeFilter,
  SavingsGoal,
  Subscription,
  TransactionType,
} from './types/finance';
import {
  loadStoredTransactions,
  saveTransactions,
  loadStoredTags,
  saveStoredTags,
  loadStoredCurrency,
  saveStoredCurrency,
  loadStoredBudget,
  saveStoredBudget,
  loadStoredSavingsGoals,
  saveStoredSavingsGoals,
  loadStoredSubscriptions,
  saveStoredSubscriptions,
  clearAllTransactionsAndData,
} from './utils/storage';
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, TAG_COLOR_PALETTE } from './utils/constants';
import { useHaptics } from './hooks/useHaptics';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import {
  subscribeUserTransactions,
  subscribeUserTags,
  subscribeUserSettings,
  subscribeUserSavingsGoals,
  subscribeUserSubscriptions,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  saveTagToCloud,
  deleteTagFromCloud,
  saveSavingsGoalToCloud,
  deleteSavingsGoalFromCloud,
  saveSubscriptionToCloud,
  deleteSubscriptionFromCloud,
  saveUserSettingsToCloud,
  syncInitialLocalDataToCloud,
} from './services/firestoreSync';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OverviewCard } from './components/OverviewCard';
import { TagFilterBar } from './components/TagFilterBar';
import { TransactionList } from './components/TransactionList';
import { TagAnalytics } from './components/TagAnalytics';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';
import { AccountModal } from './components/AccountModal';
import { WidgetsModal } from './components/WidgetsModal';
import { DownloadBanner } from './components/DownloadBanner';
import { SplashPage } from './components/SplashPage';
import { Footer } from './components/Footer';
import { SavingsGoalsCard } from './components/SavingsGoalsCard';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { SubscriptionsView } from './components/SubscriptionsView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionDueBanner } from './components/SubscriptionDueBanner';
import { SecurityLockGuard } from './components/SecurityLockGuard';
import { SecurityConfig, SecurityMode } from './types/security';
import {
  loadSecurityConfig,
  saveSecurityConfig,
  hashPin,
  generateSalt,
} from './utils/security';
import { getTodayDateString } from './utils/formatters';

export default function App() {
  const { tap, success, warning } = useHaptics();
  const { theme, setTheme } = useTheme();
  const { currentUser, setSyncStatus, setLastSyncedAt } = useAuth();

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(loadStoredTransactions);
  const [tags, setTags] = useState<CustomTag[]>(loadStoredTags);
  const [currency, setCurrency] = useState<CurrencyConfig>(loadStoredCurrency);
  const [budget, setBudget] = useState<BudgetConfig>(loadStoredBudget);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadStoredSavingsGoals);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(loadStoredSubscriptions);

  // Cloud Account & Multi-Device Modal State
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Splash Screen Animation State (displayed on app open)
  const [showSplash, setShowSplash] = useState(true);

  // Local Security Guard & PIN Lock State
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(loadSecurityConfig);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const config = loadSecurityConfig();
    return config.isEnabled && !!config.pinHash;
  });
  const [securityModalMode, setSecurityModalMode] = useState<SecurityMode | null>(null);

  // Auto-lock when app returns from background or user switches apps
  useEffect(() => {
    if (!securityConfig.isEnabled || !securityConfig.autoLockOnBackground) return;

    let backgroundTime: number | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        backgroundTime = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (backgroundTime !== null) {
          const elapsed = Date.now() - backgroundTime;
          // When returning from background, engage lock screen to guard financial data
          if (elapsed > 800) {
            setIsAppLocked(true);
          }
          backgroundTime = null;
        }
      }
    };

    const handleWindowBlur = () => {
      if (!backgroundTime) {
        backgroundTime = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (backgroundTime !== null) {
        const elapsed = Date.now() - backgroundTime;
        if (elapsed > 800) {
          setIsAppLocked(true);
        }
        backgroundTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [securityConfig.isEnabled, securityConfig.autoLockOnBackground]);

  // Real-time Cloud Database Synchronization across devices
  useEffect(() => {
    if (!currentUser) return;

    // 1. Initial migration: if user is logged in and cloud is empty but local has items
    syncInitialLocalDataToCloud(
      currentUser.uid,
      transactions,
      tags,
      {
        currency,
        budget,
        theme,
        email: currentUser.email || undefined,
        displayName: currentUser.displayName || undefined,
      },
      savingsGoals,
      subscriptions
    )
      .then(({ migratedCount }) => {
        if (migratedCount > 0) {
          setToastMessage(`✓ Synced ${migratedCount} transactions to your cloud database.`);
          setTimeout(() => setToastMessage(null), 3500);
        }
      })
      .catch((err) => console.warn('Initial cloud migration notice:', err));

    // 2. Real-time transactions listener (instant multi-device sync)
    const unsubscribeTx = subscribeUserTransactions(
      currentUser.uid,
      (cloudTx) => {
        setTransactions(cloudTx);
        saveTransactions(cloudTx);
        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Transaction sync notice:', err);
      }
    );

    // 3. Real-time tags listener
    const unsubscribeTags = subscribeUserTags(
      currentUser.uid,
      (cloudTags) => {
        if (cloudTags && cloudTags.length > 0) {
          setTags(cloudTags);
          saveStoredTags(cloudTags);
        }
      },
      (err) => {
        console.warn('Tags sync notice:', err);
      }
    );

    // 4. Real-time savings goals listener
    const unsubscribeGoals = subscribeUserSavingsGoals(
      currentUser.uid,
      (cloudGoals) => {
        if (cloudGoals && cloudGoals.length > 0) {
          setSavingsGoals(cloudGoals);
          saveStoredSavingsGoals(cloudGoals);
        }
      },
      (err) => {
        console.warn('Savings goals sync notice:', err);
      }
    );

    // 5. Real-time subscriptions listener
    const unsubscribeSubs = subscribeUserSubscriptions(
      currentUser.uid,
      (cloudSubs) => {
        if (cloudSubs && cloudSubs.length > 0) {
          setSubscriptions(cloudSubs);
          saveStoredSubscriptions(cloudSubs);
        }
      },
      (err) => {
        console.warn('Subscriptions sync notice:', err);
      }
    );

    // 6. Real-time user profile & settings listener
    const unsubscribeSettings = subscribeUserSettings(
      currentUser.uid,
      (cloudSettings) => {
        if (cloudSettings.currency) {
          setCurrency(cloudSettings.currency);
          saveStoredCurrency(cloudSettings.currency);
        }
        if (cloudSettings.budget) {
          setBudget(cloudSettings.budget);
          saveStoredBudget(cloudSettings.budget);
        }
        if (cloudSettings.theme) {
          setTheme(cloudSettings.theme);
        }
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      },
      (err) => {
        console.warn('Settings sync notice:', err);
      }
    );

    return () => {
      unsubscribeTx();
      unsubscribeTags();
      unsubscribeGoals();
      unsubscribeSubs();
      unsubscribeSettings();
    };
  }, [currentUser]);

  // UI View & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-month');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'savings'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [initialTxType, setInitialTxType] = useState<TransactionType>('expense');
  const [initialSavingsGoalId, setInitialSavingsGoalId] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Download Smart Banner state
  const [showDownloadBanner, setShowDownloadBanner] = useState(() => {
    return localStorage.getItem('numi_hide_download_banner') !== 'true';
  });

  const handleToggleDownloadBanner = (show: boolean) => {
    setShowDownloadBanner(show);
    if (!show) {
      localStorage.setItem('numi_hide_download_banner', 'true');
    } else {
      localStorage.removeItem('numi_hide_download_banner');
    }
  };

  // Deep-linking support
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const view = params.get('view');

      if (action === 'new') {
        setEditingTx(null);
        setInitialTxType('expense');
        setIsModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (action === 'savings') {
        setEditingTx(null);
        setInitialTxType('savings');
        setIsModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (view === 'widgets') {
        setIsWidgetsOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (view === 'subscriptions') {
        setActiveTab('subscriptions');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (view === 'insights' || view === 'analytics') {
        setActiveTab('analytics');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (view === 'ledger') {
        setActiveTab('ledger');
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Filter transactions by timeFilter
  const timeFilteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthPrefix = `${currentYear}-${currentMonth}`;

    const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d30.setDate(d30.getDate() - 30);
    const y30 = d30.getFullYear();
    const m30 = String(d30.getMonth() + 1).padStart(2, '0');
    const day30 = String(d30.getDate()).padStart(2, '0');
    const thirtyDaysAgoStr = `${y30}-${m30}-${day30}`;

    return transactions.filter((tx) => {
      if (timeFilter === 'this-month') {
        return tx.date.startsWith(thisMonthPrefix);
      }
      if (timeFilter === 'last-30-days') {
        return tx.date >= thirtyDaysAgoStr;
      }
      return true; // all-time
    });
  }, [transactions, timeFilter]);

  // Aggregate period figures
  const { periodIncome, periodExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    timeFilteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
      } else if (tx.type === 'expense') {
        exp += tx.amount;
      }
    });
    return { periodIncome: inc, periodExpense: exp };
  }, [timeFilteredTransactions]);

  // Count transactions per tag for the filter bar
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    timeFilteredTransactions.forEach((tx) => {
      if (tx.customTags) {
        tx.customTags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }, [timeFilteredTransactions]);

  // Check if any active subscription is due this month
  const hasDueSubscriptions = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return subscriptions.some((sub) => {
      if (sub.status !== 'active') return false;
      if (sub.reminderDismissedMonth === currentMonthYear) return false;
      if (sub.lastLoggedDate && sub.lastLoggedDate.startsWith(currentMonthYear)) return false;
      return sub.billingDay <= currentDay;
    });
  }, [subscriptions]);

  // Save transaction handler with Savings Goal accumulation
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    success();
    if (txData.id) {
      // Update existing
      const updated = transactions.map((t) =>
        t.id === txData.id
          ? {
              ...t,
              ...txData,
              id: txData.id,
              createdAt: t.createdAt,
            }
          : t
      );
      setTransactions(updated);
      saveTransactions(updated);

      const updatedTx = updated.find((t) => t.id === txData.id);
      if (currentUser && updatedTx) {
        setSyncStatus('syncing');
        saveTransactionToCloud(currentUser.uid, updatedTx)
          .then(() => {
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          })
          .catch((err) => console.warn('Cloud save notice:', err));
      }
    } else {
      // Create new
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: txData.type,
        amount: txData.amount,
        title: txData.title,
        category: txData.category,
        customTags: txData.type === 'savings' ? [] : txData.customTags || [],
        savingsGoalId: txData.type === 'savings' ? txData.savingsGoalId : undefined,
        isSubscription: txData.isSubscription,
        subscriptionId: txData.subscriptionId,
        date: txData.date,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        note: txData.note,
        createdAt: Date.now(),
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);

      if (currentUser) {
        setSyncStatus('syncing');
        saveTransactionToCloud(currentUser.uid, newTx)
          .then(() => {
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          })
          .catch((err) => console.warn('Cloud save notice:', err));
      }

      // If this is a Savings transaction with a designated goal, increment the goal's currentAmount
      if (txData.type === 'savings' && txData.savingsGoalId) {
        const goal = savingsGoals.find((g) => g.id === txData.savingsGoalId);
        if (goal) {
          const updatedGoal: SavingsGoal = {
            ...goal,
            currentAmount: goal.currentAmount + txData.amount,
          };
          const updatedGoals = savingsGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
          setSavingsGoals(updatedGoals);
          saveStoredSavingsGoals(updatedGoals);
          if (currentUser) {
            saveSavingsGoalToCloud(currentUser.uid, updatedGoal).catch((err) => console.warn(err));
          }
          setToastMessage(`✓ Added to ${goal.name}: +${currency.symbol}${txData.amount}`);
          setTimeout(() => setToastMessage(null), 3000);
        }
      }

      // If linked to a subscription, update lastLoggedDate
      if (txData.subscriptionId) {
        const sub = subscriptions.find((s) => s.id === txData.subscriptionId);
        if (sub) {
          const updatedSub: Subscription = {
            ...sub,
            lastLoggedDate: txData.date,
          };
          const updatedSubs = subscriptions.map((s) => (s.id === updatedSub.id ? updatedSub : s));
          setSubscriptions(updatedSubs);
          saveStoredSubscriptions(updatedSubs);
          if (currentUser) {
            saveSubscriptionToCloud(currentUser.uid, updatedSub).catch((err) => console.warn(err));
          }
        }
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    warning();
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);

    if (currentUser) {
      setSyncStatus('syncing');
      deleteTransactionFromCloud(currentUser.uid, id)
        .then(() => {
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        })
        .catch((err) => console.warn('Cloud delete notice:', err));
    }
  };

  // Savings Goal Handlers
  const handleSaveSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }) => {
    success();
    if (goalData.id) {
      const updated = savingsGoals.map((g) =>
        g.id === goalData.id
          ? {
              ...g,
              ...goalData,
              id: goalData.id,
              createdAt: g.createdAt,
            }
          : g
      );
      setSavingsGoals(updated);
      saveStoredSavingsGoals(updated);
      const updatedGoal = updated.find((g) => g.id === goalData.id);
      if (currentUser && updatedGoal) {
        saveSavingsGoalToCloud(currentUser.uid, updatedGoal).catch((err) => console.warn(err));
      }
    } else {
      const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount,
        targetDate: goalData.targetDate,
        color: goalData.color || '#9EE42A',
        note: goalData.note,
        createdAt: Date.now(),
      };
      const updated = [newGoal, ...savingsGoals];
      setSavingsGoals(updated);
      saveStoredSavingsGoals(updated);
      if (currentUser) {
        saveSavingsGoalToCloud(currentUser.uid, newGoal).catch((err) => console.warn(err));
      }
    }
  };

  const handleDeleteSavingsGoal = (goalId: string) => {
    warning();
    const updated = savingsGoals.filter((g) => g.id !== goalId);
    setSavingsGoals(updated);
    saveStoredSavingsGoals(updated);
    if (currentUser) {
      deleteSavingsGoalFromCloud(currentUser.uid, goalId).catch((err) => console.warn(err));
    }
  };

  // Subscription Handlers
  const handleSaveSubscription = (subData: Omit<Subscription, 'id' | 'createdAt'> & { id?: string }) => {
    success();
    if (subData.id) {
      const updated = subscriptions.map((s) =>
        s.id === subData.id
          ? {
              ...s,
              ...subData,
              id: subData.id,
              createdAt: s.createdAt,
            }
          : s
      );
      setSubscriptions(updated);
      saveStoredSubscriptions(updated);
      const updatedSub = updated.find((s) => s.id === subData.id);
      if (currentUser && updatedSub) {
        saveSubscriptionToCloud(currentUser.uid, updatedSub).catch((err) => console.warn(err));
      }
    } else {
      const newSub: Subscription = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: subData.name,
        amount: subData.amount,
        category: subData.category,
        billingDay: subData.billingDay,
        status: subData.status,
        note: subData.note,
        createdAt: Date.now(),
      };
      const updated = [newSub, ...subscriptions];
      setSubscriptions(updated);
      saveStoredSubscriptions(updated);
      if (currentUser) {
        saveSubscriptionToCloud(currentUser.uid, newSub).catch((err) => console.warn(err));
      }
    }
  };

  const handleDeleteSubscription = (subId: string) => {
    warning();
    const updated = subscriptions.filter((s) => s.id !== subId);
    setSubscriptions(updated);
    saveStoredSubscriptions(updated);
    if (currentUser) {
      deleteSubscriptionFromCloud(currentUser.uid, subId).catch((err) => console.warn(err));
    }
  };

  const handleToggleSubscriptionStatus = (subId: string) => {
    tap('light');
    const updated = subscriptions.map((s) =>
      s.id === subId ? { ...s, status: s.status === 'active' ? ('paused' as const) : ('active' as const) } : s
    );
    setSubscriptions(updated);
    saveStoredSubscriptions(updated);
    const updatedSub = updated.find((s) => s.id === subId);
    if (currentUser && updatedSub) {
      saveSubscriptionToCloud(currentUser.uid, updatedSub).catch((err) => console.warn(err));
    }
  };

  // Actionable One-Tap Reminder: Log Payment for recurring subscription
  const handleLogSubscriptionPayment = (sub: Subscription) => {
    success();
    const today = getTodayDateString();
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'expense',
      amount: sub.amount,
      title: sub.name,
      category: sub.category,
      customTags: [],
      isSubscription: true,
      subscriptionId: sub.id,
      date: today,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      note: `Recurring monthly subscription payment`,
      createdAt: Date.now(),
    };

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);
    saveTransactions(updatedTxList);

    // Update subscription lastLoggedDate
    const updatedSub: Subscription = {
      ...sub,
      lastLoggedDate: today,
    };
    const updatedSubs = subscriptions.map((s) => (s.id === sub.id ? updatedSub : s));
    setSubscriptions(updatedSubs);
    saveStoredSubscriptions(updatedSubs);

    if (currentUser) {
      setSyncStatus('syncing');
      Promise.all([
        saveTransactionToCloud(currentUser.uid, newTx),
        saveSubscriptionToCloud(currentUser.uid, updatedSub),
      ])
        .then(() => {
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        })
        .catch((err) => console.warn('Cloud subscription log notice:', err));
    }

    setToastMessage(`✓ Logged payment for ${sub.name} (${currency.symbol}${sub.amount})`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDismissSubscriptionReminder = (subId: string) => {
    tap('light');
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const updatedSubs = subscriptions.map((s) =>
      s.id === subId ? { ...s, reminderDismissedMonth: currentMonthYear } : s
    );
    setSubscriptions(updatedSubs);
    saveStoredSubscriptions(updatedSubs);
    const updatedSub = updatedSubs.find((s) => s.id === subId);
    if (currentUser && updatedSub) {
      saveSubscriptionToCloud(currentUser.uid, updatedSub).catch((err) => console.warn(err));
    }
  };

  // Tag Handlers
  const handleCreateTag = (name: string, color?: string): CustomTag => {
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newTag: CustomTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      color: color || TAG_COLOR_PALETTE[Math.floor(Math.random() * TAG_COLOR_PALETTE.length)].hex,
      createdAt: Date.now(),
    };
    const updated = [...tags, newTag];
    setTags(updated);
    saveStoredTags(updated);

    if (currentUser) {
      saveTagToCloud(currentUser.uid, newTag).catch((err) => console.warn('Cloud tag save notice:', err));
    }
    return newTag;
  };

  const handleUpdateTag = (id: string, name: string, color: string) => {
    const existing = tags.find((t) => t.id === id);
    const updatedTag: CustomTag = {
      id,
      name,
      color,
      createdAt: existing ? existing.createdAt : Date.now(),
    };
    const updated = tags.map((t) => (t.id === id ? updatedTag : t));
    setTags(updated);
    saveStoredTags(updated);
    if (currentUser) {
      saveTagToCloud(currentUser.uid, updatedTag).catch((err) => console.warn('Cloud tag update notice:', err));
    }
  };

  const handleDeleteTag = (tagId: string, tagName?: string) => {
    const tagToDelete = tags.find((t) => t.id === tagId);
    const resolvedTagName = tagName || tagToDelete?.name;

    const updated = tags.filter((t) => t.id !== tagId);
    setTags(updated);
    saveStoredTags(updated);

    if (resolvedTagName) {
      const strippedTx = transactions.map((t) => ({
        ...t,
        customTags: t.customTags ? t.customTags.filter((tn) => tn !== resolvedTagName) : [],
      }));
      setTransactions(strippedTx);
      saveTransactions(strippedTx);
    }

    if (currentUser) {
      deleteTagFromCloud(currentUser.uid, tagId).catch((err) => console.warn('Cloud tag delete notice:', err));
    }
  };

  const handleFilterByTag = (tagName: string) => {
    setSelectedTag(tagName);
    setActiveTab('ledger');
  };

  const handleTabChange = (tab: ActiveTab) => {
    tap('light');
    setActiveTab(tab);
  };

  const handleTimeFilterChange = (tf: TimeFilter) => {
    setTimeFilter(tf);
  };

  const handleDeleteAllData = () => {
    clearAllTransactionsAndData();
    setTransactions([]);
    setSelectedTag(null);
    setSearchQuery('');
    setActiveTab('ledger');
  };

  const handleImportData = (data: { transactions: Transaction[]; tags: CustomTag[] }) => {
    setTransactions(data.transactions);
    saveTransactions(data.transactions);
    setTags(data.tags);
    saveStoredTags(data.tags);
    setActiveTab('ledger');
  };

  const handleForceSync = async () => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    try {
      await syncInitialLocalDataToCloud(
        currentUser.uid,
        transactions,
        tags,
        { currency, budget, theme },
        savingsGoals,
        subscriptions
      );
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Force sync notice:', err);
      setSyncStatus('offline');
    }
  };

  // Security Handlers
  const handleSecuritySetupComplete = async (
    newPin: string,
    enableBiometrics?: boolean,
    credentialId?: string | null
  ) => {
    try {
      const salt = generateSalt();
      const pinHash = await hashPin(newPin, salt);
      const updatedConfig: SecurityConfig = {
        ...securityConfig,
        isEnabled: true,
        pinHash,
        pinSalt: salt,
        isBiometricsEnabled:
          enableBiometrics !== undefined ? enableBiometrics : securityConfig.isBiometricsEnabled,
        webAuthnCredentialId:
          credentialId !== undefined ? credentialId : securityConfig.webAuthnCredentialId,
      };
      setSecurityConfig(updatedConfig);
      saveSecurityConfig(updatedConfig);
      setSecurityModalMode(null);
      setToastMessage(
        enableBiometrics
          ? '✓ 4-digit passcode & Face ID / Touch ID active'
          : '✓ 4-digit passcode lock is now active'
      );
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('Failed to hash and save passcode:', err);
    }
  };

  const handleForgotPinRecovery = () => {
    const updatedConfig: SecurityConfig = {
      ...securityConfig,
      isEnabled: false,
      pinHash: null,
      pinSalt: null,
      isBiometricsEnabled: false,
    };
    setSecurityConfig(updatedConfig);
    saveSecurityConfig(updatedConfig);
    setIsAppLocked(false);
    setToastMessage('✓ Identity verified. Passcode has been reset.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors">
      {/* Splash Page Animation on App Open */}
      {showSplash && (
        <SplashPage
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Security Privacy Screen & Authentication Guard */}
      {isAppLocked && (
        <SecurityLockGuard
          mode="unlock"
          config={securityConfig}
          onSuccess={() => setIsAppLocked(false)}
          onForgotPin={handleForgotPinRecovery}
        />
      )}

      {/* Security Setup / Change PIN Modal */}
      {securityModalMode && (
        <SecurityLockGuard
          mode={securityModalMode}
          config={securityConfig}
          onSuccess={() => setSecurityModalMode(null)}
          onCancel={() => setSecurityModalMode(null)}
          onSetupComplete={handleSecuritySetupComplete}
        />
      )}

      {/* Top Download Smart Banner */}
      {showDownloadBanner && (
        <DownloadBanner
          onDismiss={() => handleToggleDownloadBanner(false)}
        />
      )}

      {/* Responsive layout container */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          onOpenSettings={() => {
            tap('light');
            setIsSettingsOpen(true);
          }}
          currency={currency}
          onTabChange={handleTabChange}
          onOpenAddModal={() => {
            tap('medium');
            setEditingTx(null);
            setInitialTxType('expense');
            setIsModalOpen(true);
          }}
          onOpenAccount={() => {
            tap('light');
            setIsAccountOpen(true);
          }}
          onOpenWidgets={() => {
            tap('light');
            setIsWidgetsOpen(true);
          }}
          hasDueSubscriptions={hasDueSubscriptions}
        />

        {/* Main Tab Content */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 pb-24 md:pb-12">
          {/* Actionable Recurring Subscription Due Banner */}
          <SubscriptionDueBanner
            subscriptions={subscriptions}
            currency={currency}
            onLogPayment={handleLogSubscriptionPayment}
            onDismissReminder={handleDismissSubscriptionReminder}
            onOpenSubscriptions={() => setActiveTab('subscriptions')}
          />

          {/* TAB 1: Ledger / Wallet View */}
          {activeTab === 'ledger' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column (Sticky Sidebar on Desktop): Overview, Savings Card & Tags Filter */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
                {/* Apple Card Style Overview Card */}
                <OverviewCard
                  income={periodIncome}
                  expense={periodExpense}
                  currency={currency}
                  monthlyBudget={budget.monthlyLimit}
                  onOpenAnalytics={() => setActiveTab('analytics')}
                  timeFilter={timeFilter}
                />

                {/* Savings Targets Card on Overview Dashboard */}
                <SavingsGoalsCard
                  goals={savingsGoals}
                  currency={currency}
                  onOpenNewGoalModal={() => {
                    setEditingSavingsGoal(null);
                    setIsSavingsGoalModalOpen(true);
                  }}
                  onEditGoal={(goal) => {
                    setEditingSavingsGoal(goal);
                    setIsSavingsGoalModalOpen(true);
                  }}
                  onAddSavingsForGoal={(goal) => {
                    setInitialTxType('savings');
                    setInitialSavingsGoalId(goal.id);
                    setEditingTx(null);
                    setIsModalOpen(true);
                  }}
                />

                {/* Apple Pill Horizontal Custom Tag Filter */}
                <TagFilterBar
                  tags={tags}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  onOpenTagManager={() => setActiveTab('tags')}
                  tagCounts={tagCounts}
                />
              </div>

              {/* Right Column: Inset Grouped Transaction Feed */}
              <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                <TransactionList
                  transactions={timeFilteredTransactions}
                  categories={DEFAULT_CATEGORIES}
                  tags={tags}
                  currency={currency}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  typeFilter={typeFilter}
                  onTypeFilterChange={setTypeFilter}
                  onEditTransaction={(tx) => {
                    setEditingTx(tx);
                    setIsModalOpen(true);
                  }}
                  onAddNew={() => {
                    setEditingTx(null);
                    setInitialTxType('expense');
                    setIsModalOpen(true);
                  }}
                  timeFilter={timeFilter}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Subscriptions Hub View */}
          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              currency={currency}
              onOpenAddSubscription={() => {
                setEditingSubscription(null);
                setIsSubscriptionModalOpen(true);
              }}
              onEditSubscription={(sub) => {
                setEditingSubscription(sub);
                setIsSubscriptionModalOpen(true);
              }}
              onToggleStatus={handleToggleSubscriptionStatus}
              onDeleteSubscription={handleDeleteSubscription}
              onLogPayment={handleLogSubscriptionPayment}
            />
          )}

          {/* TAB 3: Custom Tags View */}
          {activeTab === 'tags' && (
            <TagAnalytics
              transactions={timeFilteredTransactions}
              tags={tags}
              currency={currency}
              onCreateTag={handleCreateTag}
              onUpdateTag={handleUpdateTag}
              onDeleteTag={handleDeleteTag}
              onFilterByTag={handleFilterByTag}
            />
          )}

          {/* TAB 4: Analytics View */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={timeFilteredTransactions}
              categories={DEFAULT_CATEGORIES}
              currency={currency}
              budget={budget}
              onEditBudget={() => setIsSettingsOpen(true)}
            />
          )}
        </main>

        {/* Small Footer with Product Hunt HTML Embed */}
        <Footer
          onReplaySplash={() => setShowSplash(true)}
          onOpenSettings={() => {
            tap('light');
            setIsSettingsOpen(true);
          }}
        />

        {/* Fixed Responsive Bottom Navigation Bar for Mobile Viewports */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddModal={() => {
            tap('medium');
            setEditingTx(null);
            setInitialTxType('expense');
            setIsModalOpen(true);
          }}
          hasDueSubscriptions={hasDueSubscriptions}
        />

        {/* Transaction Add/Edit Sheet Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTx(null);
            setInitialSavingsGoalId('');
          }}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          editingTransaction={editingTx}
          categories={DEFAULT_CATEGORIES}
          availableTags={tags}
          onCreateTag={handleCreateTag}
          currency={currency}
          savingsGoals={savingsGoals}
          onOpenNewGoalModal={() => {
            setIsModalOpen(false);
            setEditingSavingsGoal(null);
            setIsSavingsGoalModalOpen(true);
          }}
          subscriptions={subscriptions}
          initialType={initialTxType}
          initialSavingsGoalId={initialSavingsGoalId}
        />

        {/* Savings Goal Add/Edit Sheet Modal */}
        <SavingsGoalModal
          isOpen={isSavingsGoalModalOpen}
          onClose={() => {
            setIsSavingsGoalModalOpen(false);
            setEditingSavingsGoal(null);
          }}
          onSave={handleSaveSavingsGoal}
          onDelete={handleDeleteSavingsGoal}
          editingGoal={editingSavingsGoal}
          currency={currency}
        />

        {/* Recurring Subscription Add/Edit Sheet Modal */}
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => {
            setIsSubscriptionModalOpen(false);
            setEditingSubscription(null);
          }}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
          editingSubscription={editingSubscription}
          currency={currency}
          categories={DEFAULT_CATEGORIES}
        />

        {/* Settings & Preferences Sheet Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currency={currency}
          onUpdateCurrency={(c) => {
            setCurrency(c);
            saveStoredCurrency(c);
            if (currentUser) {
              saveUserSettingsToCloud(currentUser.uid, { currency: c }).catch((err) => console.warn(err));
            }
          }}
          budget={budget}
          onUpdateBudget={(b) => {
            setBudget(b);
            saveStoredBudget(b);
            if (currentUser) {
              saveUserSettingsToCloud(currentUser.uid, { budget: b }).catch((err) => console.warn(err));
            }
          }}
          transactions={transactions}
          tags={tags}
          onDeleteAllData={handleDeleteAllData}
          onImportData={handleImportData}
          showDownloadBanner={showDownloadBanner}
          onToggleDownloadBanner={handleToggleDownloadBanner}
          theme={theme}
          onUpdateTheme={setTheme}
          onOpenAccountModal={() => {
            tap('light');
            setIsAccountOpen(true);
          }}
          onOpenWidgetsModal={() => {
            tap('light');
            setIsWidgetsOpen(true);
          }}
          onReplaySplash={() => setShowSplash(true)}
          securityConfig={securityConfig}
          onUpdateSecurityConfig={(newCfg) => {
            setSecurityConfig(newCfg);
            saveSecurityConfig(newCfg);
          }}
          onOpenSecuritySetup={() => setSecurityModalMode('setup')}
          onOpenSecurityChange={() => setSecurityModalMode('change')}
          onLockAppNow={() => setIsAppLocked(true)}
        />

        {/* Multi-Device Cloud Sync & Account Modal */}
        <AccountModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          transactionCount={transactions.length}
          tagCount={tags.length}
          onForceSync={handleForceSync}
        />

        {/* Mobile Home Screen Widgets Modal */}
        <WidgetsModal
          isOpen={isWidgetsOpen}
          onClose={() => setIsWidgetsOpen(false)}
          transactions={transactions}
          budget={budget}
          currency={currency}
          onOpenAddModal={() => {
            setEditingTx(null);
            setInitialTxType('expense');
            setIsModalOpen(true);
          }}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#1D1D1F] dark:bg-[#2C2C2E] text-white text-xs font-semibold rounded-full shadow-xl border border-transparent dark:border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
