import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import {
  Transaction,
  CustomTag,
  CurrencyConfig,
  BudgetConfig,
  ThemeMode,
  SavingsGoal,
  Subscription,
} from '../types/finance';

export interface UserCloudSettings {
  userId: string;
  email?: string;
  displayName?: string;
  currency?: CurrencyConfig;
  budget?: BudgetConfig;
  theme?: ThemeMode;
  updatedAt?: number;
}

/**
 * Real-time listener for user transactions with strict error handling.
 */
export function subscribeUserTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/transactions`;
  const transactionsRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    transactionsRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id || docSnap.id,
          type: data.type,
          amount: Number(data.amount),
          title: data.title || '',
          category: data.category || '',
          customTags: Array.isArray(data.customTags) ? data.customTags : [],
          savingsGoalId: data.savingsGoalId || undefined,
          subscriptionId: data.subscriptionId || undefined,
          isSubscription: typeof data.isSubscription === 'boolean' ? data.isSubscription : undefined,
          date: data.date || '',
          time: data.time || undefined,
          note: data.note || undefined,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      // Sort newest first
      items.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user custom tags.
 */
export function subscribeUserTags(
  userId: string,
  onData: (tags: CustomTag[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/tags`;
  const tagsRef = collection(db, 'users', userId, 'tags');

  return onSnapshot(
    tagsRef,
    (snapshot) => {
      const items: CustomTag[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id || docSnap.id,
          name: data.name || '',
          color: data.color || '#007AFF',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user savings goals.
 */
export function subscribeUserSavingsGoals(
  userId: string,
  onData: (goals: SavingsGoal[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/savingsGoals`;
  const goalsRef = collection(db, 'users', userId, 'savingsGoals');

  return onSnapshot(
    goalsRef,
    (snapshot) => {
      const items: SavingsGoal[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id || docSnap.id,
          name: data.name || '',
          targetAmount: Number(data.targetAmount) || 0,
          currentAmount: Number(data.currentAmount) || 0,
          targetDate: data.targetDate || undefined,
          color: data.color || '#9EE42A',
          note: data.note || undefined,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user recurring subscriptions.
 */
export function subscribeUserSubscriptions(
  userId: string,
  onData: (subs: Subscription[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/subscriptions`;
  const subsRef = collection(db, 'users', userId, 'subscriptions');

  return onSnapshot(
    subsRef,
    (snapshot) => {
      const items: Subscription[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: data.id || docSnap.id,
          name: data.name || '',
          amount: Number(data.amount) || 0,
          category: data.category || 'Utilities',
          billingDay: Number(data.billingDay) || 1,
          status: data.status === 'paused' ? 'paused' : 'active',
          lastLoggedDate: data.lastLoggedDate || undefined,
          reminderDismissedMonth: data.reminderDismissedMonth || undefined,
          note: data.note || undefined,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      });
      // Sort by billing day ascending
      items.sort((a, b) => a.billingDay - b.billingDay);
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user settings.
 */
export function subscribeUserSettings(
  userId: string,
  onData: (settings: UserCloudSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}`;
  const userDocRef = doc(db, 'users', userId);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserCloudSettings;
        onData(data);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Add or update a transaction in the user's cloud database.
 */
export async function saveTransactionToCloud(userId: string, tx: Transaction): Promise<void> {
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', tx.id);
    const cleanPayload: Record<string, unknown> = {
      id: tx.id,
      userId,
      type: tx.type,
      amount: Number(tx.amount),
      title: tx.title.slice(0, 120),
      category: tx.category.slice(0, 60),
      customTags: (tx.customTags || []).slice(0, 20),
      date: tx.date.slice(0, 20),
      createdAt: tx.createdAt || Date.now(),
    };
    if (tx.time) cleanPayload.time = tx.time.slice(0, 10);
    if (tx.note) cleanPayload.note = tx.note.slice(0, 500);
    if (tx.savingsGoalId) cleanPayload.savingsGoalId = tx.savingsGoalId.slice(0, 128);
    if (tx.subscriptionId) cleanPayload.subscriptionId = tx.subscriptionId.slice(0, 128);
    if (typeof tx.isSubscription === 'boolean') cleanPayload.isSubscription = tx.isSubscription;

    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a transaction from the cloud database.
 */
export async function deleteTransactionFromCloud(userId: string, txId: string): Promise<void> {
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save custom tag to cloud database.
 */
export async function saveTagToCloud(userId: string, tag: CustomTag): Promise<void> {
  const path = `users/${userId}/tags/${tag.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'tags', tag.id);
    await setDoc(
      docRef,
      {
        id: tag.id,
        userId,
        name: tag.name.slice(0, 50),
        color: tag.color.slice(0, 30),
        createdAt: tag.createdAt || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete custom tag from cloud database.
 */
export async function deleteTagFromCloud(userId: string, tagId: string): Promise<void> {
  const path = `users/${userId}/tags/${tagId}`;
  try {
    const docRef = doc(db, 'users', userId, 'tags', tagId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update savings goal in cloud database.
 */
export async function saveSavingsGoalToCloud(userId: string, goal: SavingsGoal): Promise<void> {
  const path = `users/${userId}/savingsGoals/${goal.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'savingsGoals', goal.id);
    const payload: Record<string, unknown> = {
      id: goal.id,
      userId,
      name: goal.name.slice(0, 100),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      createdAt: goal.createdAt || Date.now(),
    };
    if (goal.targetDate) payload.targetDate = goal.targetDate.slice(0, 20);
    if (goal.color) payload.color = goal.color.slice(0, 30);
    if (goal.note) payload.note = goal.note.slice(0, 500);

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete savings goal from cloud database.
 */
export async function deleteSavingsGoalFromCloud(userId: string, goalId: string): Promise<void> {
  const path = `users/${userId}/savingsGoals/${goalId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savingsGoals', goalId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update subscription in cloud database.
 */
export async function saveSubscriptionToCloud(userId: string, sub: Subscription): Promise<void> {
  const path = `users/${userId}/subscriptions/${sub.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'subscriptions', sub.id);
    const payload: Record<string, unknown> = {
      id: sub.id,
      userId,
      name: sub.name.slice(0, 100),
      amount: Number(sub.amount),
      category: sub.category.slice(0, 60),
      billingDay: Number(sub.billingDay),
      status: sub.status,
      createdAt: sub.createdAt || Date.now(),
    };
    if (sub.lastLoggedDate) payload.lastLoggedDate = sub.lastLoggedDate.slice(0, 20);
    if (sub.reminderDismissedMonth) payload.reminderDismissedMonth = sub.reminderDismissedMonth.slice(0, 10);
    if (sub.note) payload.note = sub.note.slice(0, 500);

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete subscription from cloud database.
 */
export async function deleteSubscriptionFromCloud(userId: string, subId: string): Promise<void> {
  const path = `users/${userId}/subscriptions/${subId}`;
  try {
    const docRef = doc(db, 'users', userId, 'subscriptions', subId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save or update user settings and profile in cloud database.
 */
export async function saveUserSettingsToCloud(
  userId: string,
  settings: Partial<UserCloudSettings>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const dataToSave: Record<string, unknown> = {
      userId,
      updatedAt: Date.now(),
    };
    if (settings.email) dataToSave.email = settings.email.slice(0, 256);
    if (settings.displayName) dataToSave.displayName = settings.displayName.slice(0, 128);
    if (settings.currency) dataToSave.currency = settings.currency;
    if (settings.budget) dataToSave.budget = settings.budget;
    if (settings.theme) dataToSave.theme = settings.theme;

    await setDoc(userDocRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Initial sync / migration when a user signs in for the first time:
 * If cloud has no transactions but local storage has transactions, copy local data to cloud.
 */
export async function syncInitialLocalDataToCloud(
  userId: string,
  localTransactions: Transaction[],
  localTags: CustomTag[],
  initialSettings?: Partial<UserCloudSettings>,
  localSavingsGoals?: SavingsGoal[],
  localSubscriptions?: Subscription[]
): Promise<{ migratedCount: number }> {
  const txCollectionPath = `users/${userId}/transactions`;
  try {
    const txCollectionRef = collection(db, 'users', userId, 'transactions');
    const existingSnap = await getDocs(txCollectionRef);

    if (existingSnap.empty && localTransactions.length > 0) {
      const batch = writeBatch(db);
      // Migrate up to 100 recent transactions
      localTransactions.slice(0, 100).forEach((tx) => {
        const ref = doc(db, 'users', userId, 'transactions', tx.id);
        const cleanPayload: Record<string, unknown> = {
          id: tx.id,
          userId,
          type: tx.type,
          amount: Number(tx.amount),
          title: tx.title.slice(0, 120),
          category: tx.category.slice(0, 60),
          customTags: (tx.customTags || []).slice(0, 20),
          date: tx.date.slice(0, 20),
          createdAt: tx.createdAt || Date.now(),
        };
        if (tx.time) cleanPayload.time = tx.time.slice(0, 10);
        if (tx.note) cleanPayload.note = tx.note.slice(0, 500);
        if (tx.savingsGoalId) cleanPayload.savingsGoalId = tx.savingsGoalId.slice(0, 128);
        if (tx.subscriptionId) cleanPayload.subscriptionId = tx.subscriptionId.slice(0, 128);
        if (typeof tx.isSubscription === 'boolean') cleanPayload.isSubscription = tx.isSubscription;
        batch.set(ref, cleanPayload);
      });

      // Migrate custom tags
      localTags.forEach((tag) => {
        const tagRef = doc(db, 'users', userId, 'tags', tag.id);
        batch.set(tagRef, {
          id: tag.id,
          userId,
          name: tag.name.slice(0, 50),
          color: tag.color.slice(0, 30),
          createdAt: tag.createdAt || Date.now(),
        });
      });

      // Migrate savings goals
      if (localSavingsGoals) {
        localSavingsGoals.forEach((goal) => {
          const goalRef = doc(db, 'users', userId, 'savingsGoals', goal.id);
          const payload: Record<string, unknown> = {
            id: goal.id,
            userId,
            name: goal.name.slice(0, 100),
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            createdAt: goal.createdAt || Date.now(),
          };
          if (goal.targetDate) payload.targetDate = goal.targetDate.slice(0, 20);
          if (goal.color) payload.color = goal.color.slice(0, 30);
          batch.set(goalRef, payload);
        });
      }

      // Migrate subscriptions
      if (localSubscriptions) {
        localSubscriptions.forEach((sub) => {
          const subRef = doc(db, 'users', userId, 'subscriptions', sub.id);
          batch.set(subRef, {
            id: sub.id,
            userId,
            name: sub.name.slice(0, 100),
            amount: Number(sub.amount),
            category: sub.category.slice(0, 60),
            billingDay: Number(sub.billingDay),
            status: sub.status,
            createdAt: sub.createdAt || Date.now(),
          });
        });
      }

      await batch.commit();
      return { migratedCount: localTransactions.length };
    }

    if (initialSettings) {
      await saveUserSettingsToCloud(userId, initialSettings);
    }

    return { migratedCount: 0 };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, txCollectionPath);
  }
}
