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
import { Transaction, CustomTag, CurrencyConfig, BudgetConfig, ThemeMode } from '../types/finance';

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
  initialSettings?: Partial<UserCloudSettings>
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
        batch.set(ref, cleanPayload);
      });

      // Also migrate custom tags
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
