import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  X,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHaptics } from '../hooks/useHaptics';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionCount: number;
  tagCount: number;
  onForceSync?: () => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  transactionCount,
  tagCount,
  onForceSync,
}) => {
  const {
    currentUser,
    signInWithGoogle,
    signOutUser,
    syncStatus,
    authError,
    clearAuthError,
    isOnline,
    lastSyncedAt,
  } = useAuth();
  const { tap, success, warning } = useHaptics();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    tap('medium');
    setIsSigningIn(true);
    setSyncMessage(null);
    try {
      await signInWithGoogle();
      success();
      setSyncMessage('Successfully signed in! Your data is now syncing across devices.');
    } catch {
      warning();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    tap('light');
    try {
      await signOutUser();
      success();
      setSyncMessage('Signed out. Local data is retained on this device.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    if (!onForceSync || isSyncingManual) return;
    tap('light');
    setIsSyncingManual(true);
    try {
      await onForceSync();
      success();
      setSyncMessage('Sync complete! All devices are up to date.');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err) {
      console.error(err);
      warning();
    } finally {
      setIsSyncingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 flex items-center justify-center text-[#007AFF] dark:text-[#0A84FF]">
              <Database size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight">
                Multi-Device Cloud Sync
              </h2>
              <p className="text-xs text-[#8E8E93]">Powered by Firebase Firestore</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Banner */}
          {syncMessage && (
            <div className="p-3 rounded-2xl bg-[#34C759]/10 text-[#30D158] dark:text-[#34C759] text-xs font-semibold flex items-center gap-2 border border-[#34C759]/20">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-semibold flex items-center justify-between gap-2 border border-[#FF3B30]/20">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-[11px] underline font-bold shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* User Status Card */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/[0.04] dark:border-white/[0.04] space-y-3.5">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full ring-2 ring-[#007AFF]/30 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-lg font-bold">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1D1D1F] dark:text-white truncate">
                      {currentUser.displayName || 'Numi User'}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/15 text-[#30D158] dark:text-[#34C759]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
                      Synced
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E93] truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Multi-Device Status Badges */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04]">
                  <p className="text-[#8E8E93]">Transactions</p>
                  <p className="font-bold text-sm text-[#1D1D1F] dark:text-white">{transactionCount}</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04]">
                  <p className="text-[#8E8E93]">Custom Tags</p>
                  <p className="font-bold text-sm text-[#1D1D1F] dark:text-white">{tagCount}</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.04]">
                  <p className="text-[#8E8E93]">Connectivity</p>
                  <p className={`font-bold text-sm ${isOnline ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Sync Timestamp & Action */}
              <div className="flex items-center justify-between text-xs text-[#8E8E93] pt-1">
                <span>
                  {lastSyncedAt
                    ? `Last synced: ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Real-time sync active'}
                </span>
                {onForceSync && (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncingManual || !isOnline}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#007AFF] dark:text-[#0A84FF] font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer text-xs"
                  >
                    <RefreshCw size={13} className={isSyncingManual ? 'animate-spin' : ''} />
                    <span>{isSyncingManual ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Not Signed In Prompt */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#007AFF]/10 via-[#5856D6]/10 to-transparent border border-[#007AFF]/20 space-y-3">
                <div className="flex items-center gap-2 text-[#007AFF] dark:text-[#0A84FF] font-semibold text-xs">
                  <Cloud size={16} />
                  <span>Access on Any Device</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-white">
                  Keep your finances updated anywhere
                </h3>
                <p className="text-xs text-[#636366] dark:text-[#8E8E93] leading-relaxed">
                  Sign in with Google to create a secure personal database. When you add or edit transactions on your phone, they will immediately appear on your laptop, tablet, or another browser.
                </p>

                <div className="flex items-center gap-3 pt-2 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <Smartphone size={15} className="text-[#007AFF]" />
                    <span>Phone</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Tablet size={15} className="text-[#5856D6]" />
                    <span>Tablet</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Laptop size={15} className="text-[#34C759]" />
                    <span>Computer</span>
                  </div>
                </div>
              </div>

              {/* Sign in with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] dark:bg-[#0A84FF] dark:hover:bg-[#0071E3] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Signing in & syncing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#8E8E93]">
                Your existing local data will be automatically copied to your cloud account so nothing is lost.
              </p>
            </div>
          )}

          {/* Device Capabilities List */}
          <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Cross-Device Architecture
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <CheckCircle2 size={16} className="text-[#34C759] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Instant Real-Time Sync:</span> Changes on any device update live without refreshing.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <ShieldCheck size={16} className="text-[#007AFF] dark:text-[#0A84FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Zero-Trust Isolation:</span> Hardened Firestore security rules ensure only you can access your transactions.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <CloudCheck size={16} className="text-[#5856D6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Offline-First Resiliency:</span> Add expenses even when traveling without signal; data automatically syncs once reconnected.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#F2F2F7] dark:bg-[#2C2C2E]/40 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          {currentUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out of Cloud</span>
            </button>
          ) : (
            <div className="text-xs text-[#8E8E93]">
              Device storage active
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-white shadow-xs hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
