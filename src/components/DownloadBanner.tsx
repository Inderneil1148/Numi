import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  ArrowDownToLine,
  Star,
  Monitor,
  Apple,
} from 'lucide-react';
import { CoinIcon } from './NumiLogo';
import { useHaptics } from '../hooks/useHaptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface DownloadBannerProps {
  onDismiss?: () => void;
}

export const DownloadBanner: React.FC<DownloadBannerProps> = ({ onDismiss }) => {
  const { tap, success } = useHaptics();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect if running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect device platform for default tab
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveTab('ios');
    } else if (/android/.test(userAgent)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    // Listen for browser install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    tap('medium');
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          success();
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Top Download Smart Banner */}
      <div className="w-full bg-[#16171B] text-white border-b border-white/[0.08] shadow-md relative z-40 transition-all select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Dismiss Button & App Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onDismiss && (
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  onDismiss();
                }}
                className="w-7 h-7 -ml-1 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss download banner"
                title="Dismiss banner"
              >
                <X size={15} />
              </button>
            )}

            {/* Coin App Icon Tile */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-[#2C2E38] to-[#121316] p-1 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/10 shrink-0">
              <CoinIcon size={26} />
            </div>

            {/* App Title & Value Proposition */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                  Numi: Finance Tracker
                </span>
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#9EE42A]/15 text-[#9EE42A] border border-[#9EE42A]/30">
                  <Star size={10} className="fill-[#9EE42A]" /> 4.9
                </span>
                <span className="text-[10px] text-white/50 hidden md:inline">
                  · Free & Private
                </span>
              </div>
              <p className="text-[11px] text-white/70 truncate flex items-center gap-1">
                <span className="hidden sm:inline">Install on Home Screen ·</span>
                <span>Fast offline logging & zero tracking</span>
              </p>
            </div>
          </div>

          {/* Right: Single Primary Download / Install Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-bold rounded-full bg-[#9EE42A] hover:bg-[#8CD51B] active:bg-[#7DC214] text-[#0E1013] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowDownToLine size={14} strokeWidth={2.5} />
              <span>{isInstalled ? 'App Ready' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Installation Guide Modal (iPhone, Android, Desktop) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] space-y-4 animate-in zoom-in-95 duration-200 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                tap('light');
                setIsModalOpen(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Header: Coin Icon + Title */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2C2E38] to-[#121316] p-1.5 flex items-center justify-center shadow-md border border-white/10 shrink-0">
                <CoinIcon size={34} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight">
                  How to Install Numi
                </h3>
                <p className="text-xs text-[#86868B]">
                  Add to home screen for instant offline access
                </p>
              </div>
            </div>

            {/* Direct 1-Click Install Button (When browser supports native prompt) */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-[#9EE42A] hover:bg-[#8CD51B] text-[#0E1013] font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownToLine size={16} strokeWidth={2.5} />
                <span>Install Directly on This Device</span>
              </button>
            )}

            {/* Platform Selection Tabs: iPhone | Android | Desktop */}
            <div className="p-1 bg-[#E5E5EA] rounded-2xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setActiveTab('ios');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Apple size={14} />
                <span>iPhone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setActiveTab('android');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Smartphone size={14} />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  tap('light');
                  setActiveTab('desktop');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Monitor size={14} />
                <span>Desktop</span>
              </button>
            </div>

            {/* Step-by-Step Instructions Container */}
            <div className="p-4 bg-[#F2F2F7] rounded-2xl border border-black/[0.05] min-h-[140px] flex flex-col justify-center">
              {/* iPhone / iOS Guide */}
              {activeTab === 'ios' && (
                <div className="space-y-3 text-xs text-[#1D1D1F]">
                  <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                    Install on iPhone / iPad (Safari)
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#007AFF] shadow-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-snug">
                      Tap the <Share size={13} className="inline text-[#007AFF] mx-0.5" /> <strong>Share</strong> button at the bottom of Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#007AFF] shadow-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-snug">
                      Scroll down and tap <PlusSquare size={13} className="inline text-[#1D1D1F] mx-0.5" /> <strong>Add to Home Screen</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#007AFF] shadow-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="leading-snug">
                      Tap <strong>Add</strong> in the top-right corner to place Numi on your home screen.
                    </span>
                  </div>
                </div>
              )}

              {/* Android Guide */}
              {activeTab === 'android' && (
                <div className="space-y-3 text-xs text-[#1D1D1F]">
                  <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                    Install on Android (Chrome / Browser)
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#34C759] shadow-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-snug">
                      Tap the <strong>three dots (⋮)</strong> menu in Chrome's top right.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#34C759] shadow-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-snug">
                      Select <Smartphone size={13} className="inline text-[#34C759] mx-0.5" /> <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#34C759] shadow-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="leading-snug">
                      Tap <strong>Install</strong> to add Numi to your app drawer and home screen.
                    </span>
                  </div>
                </div>
              )}

              {/* Desktop Guide */}
              {activeTab === 'desktop' && (
                <div className="space-y-3 text-xs text-[#1D1D1F]">
                  <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                    Install on Desktop (Chrome, Edge, Safari)
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#007AFF] shadow-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-snug">
                      Look for the <strong>Install icon (⊕ or computer)</strong> in the right side of your browser's address bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white font-bold flex items-center justify-center text-[11px] text-[#007AFF] shadow-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-snug">
                      Click <strong>Install</strong> to run Numi as a fast, standalone desktop app without browser tabs.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dismiss & Close */}
            <button
              type="button"
              onClick={() => {
                tap('light');
                setIsModalOpen(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-[#E5E5EA] hover:bg-[#D8D8DC] text-[#1D1D1F] font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
