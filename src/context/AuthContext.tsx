import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local-only';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isOnline: boolean;
  lastSyncedAt: Date | null;
  setLastSyncedAt: (date: Date | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local-only');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentUser) setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Firebase auth state subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
        if (user) {
          setSyncStatus('syncing');
        } else {
          setSyncStatus('local-only');
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      const message = err instanceof Error ? err.message : 'Google sign-in could not be completed';
      // Suppress benign popup-closed errors
      if (!message.includes('popup-closed-by-user')) {
        setAuthError(message);
      }
      setSyncStatus(currentUser ? 'synced' : 'local-only');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setSyncStatus('local-only');
      setLastSyncedAt(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      syncStatus,
      setSyncStatus,
      signInWithGoogle,
      signOutUser,
      authError,
      clearAuthError,
      isOnline,
      lastSyncedAt,
      setLastSyncedAt,
    }),
    [currentUser, loading, syncStatus, authError, isOnline, lastSyncedAt]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
