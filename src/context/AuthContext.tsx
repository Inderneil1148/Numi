import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local-only';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  signInWithGoogle: () => Promise<boolean>;
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
        console.warn('Auth state subscription warning:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setAuthError(null);
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      return true;
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code || '';
      const message = errorObj?.message || (err instanceof Error ? err.message : '');

      // Gracefully handle benign user-dismissed popup or cancelled request
      const isUserCancellation =
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled' ||
        message.includes('popup-closed-by-user') ||
        message.includes('cancelled-popup-request');

      if (isUserCancellation) {
        // User closed the popup without choosing an account; reset status quietly
        setSyncStatus(currentUser ? 'synced' : 'local-only');
        return false;
      }

      // Handle popup blocked by browser
      if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
        console.warn('Google sign-in popup was blocked by browser.');
        setAuthError('Pop-up was blocked by your browser. Please allow pop-ups for this site, or open in a full browser tab.');
        setSyncStatus(currentUser ? 'synced' : 'local-only');
        return false;
      }

      // Handle unauthorized domain (e.g. Firebase project missing Cloud Run domain)
      const isUnauthorizedDomain =
        code === 'auth/unauthorized-domain' ||
        message.includes('unauthorized-domain') ||
        message.includes('not authorized to run this operation');

      if (isUnauthorizedDomain) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        console.warn(`Domain unauthorized for Firebase Auth: ${domain}`);
        setAuthError(
          `Domain "${domain}" is not in your Firebase Authorized Domains list. Please add "${domain}" in Firebase Console > Authentication > Settings > Authorized domains.`
        );
        setSyncStatus(currentUser ? 'synced' : 'local-only');
        return false;
      }

      // Handle operation not allowed
      const isOperationNotAllowed =
        code === 'auth/operation-not-allowed' ||
        message.includes('operation-not-allowed');

      if (isOperationNotAllowed) {
        console.warn('Google Sign-In is not enabled in Firebase Authentication.');
        setAuthError('Google Sign-In is not enabled in Firebase Authentication. Please enable Google provider in the Firebase Console.');
        setSyncStatus(currentUser ? 'synced' : 'local-only');
        return false;
      }

      // Handle network failure
      const isNetworkError =
        code === 'auth/network-request-failed' ||
        message.includes('network-request-failed');

      if (isNetworkError) {
        console.warn('Network request failed during Google sign-in.');
        setAuthError('Network error connecting to Google Auth. Please check your internet connection and try again.');
        setSyncStatus(currentUser ? 'synced' : 'local-only');
        return false;
      }

      // Log other unexpected errors as a warning without breaking the applet
      console.warn('Google sign-in notice:', message || err);
      let cleanMessage = message.replace(/^Firebase:\s*Error\s*\((.*?)\)\.?/i, '$1').trim();
      if (!cleanMessage || cleanMessage === message) {
        cleanMessage = message.replace(/^FirebaseError:\s*/i, '').trim();
      }
      setAuthError(cleanMessage || 'Google sign-in could not be completed. Please try again.');
      setSyncStatus(currentUser ? 'synced' : 'local-only');
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setSyncStatus('local-only');
      setLastSyncedAt(null);
    } catch (err) {
      console.warn('Sign-out notice:', err);
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
