import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useHaptics } from '../hooks/useHaptics';
import {
  Download,
  Share2,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { NumiLogo } from './NumiLogo';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { tap, success } = useHaptics();

  // Default to user's detected platform: 'ios' if iOS device, otherwise 'android'
  const [platformTab, setPlatformTab] = useState<'ios' | 'android'>(() => (isIOS ? 'ios' : 'android'));
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    tap('medium');
    const result = await install();
    if (result) {
      success();
      onClose();
    }
  };

  const handleShareLink = async () => {
    tap('light');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Numi - Minimal Expense & Tag Tracker',
          text: 'Track expenses and tags on iPhone or Android with Numi.',
          url: window.location.href,
        });
        success();
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      success();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F0F4F9] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#1F1F1F]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-8 h-1 bg-[#747775]/40 rounded-full" />
        </div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E2EC] bg-[#F0F4F9]">
          <div className="flex items-center gap-2.5">
            <NumiLogo variant="badge" size={32} />
            <div>
              <h2 id="install-modal-title" className="text-base font-bold text-[#1F1F1F] tracking-tight">
                Install Numi App
              </h2>
              <p className="text-[11px] text-[#444746]">Available on iOS (iPhone &amp; iPad) and Android</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#E0E2EC]/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Selector Segmented Control (iOS vs Android) */}
        <div className="p-3 bg-[#F0F4F9] border-b border-[#E0E2EC]">
          <div className="flex p-1 bg-[#E0E2EC]/70 rounded-xl">
            <button
              type="button"
              onClick={() => {
                tap('light');
                setPlatformTab('ios');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-2 cursor-pointer ${
                platformTab === 'ios'
                  ? 'bg-white text-[#041E49] shadow-xs font-bold'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              <span>🍎</span>
              <span>iPhone &amp; iPad (iOS)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                tap('light');
                setPlatformTab('android');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-2 cursor-pointer ${
                platformTab === 'android'
                  ? 'bg-white text-[#041E49] shadow-xs font-bold'
                  : 'text-[#444746] hover:text-[#1F1F1F]'
              }`}
            >
              <span>🤖</span>
              <span>Android Phone &amp; Tablet</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Hero Card for Selected Platform */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#E0E2EC] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#0B57D0] uppercase tracking-wider bg-[#D3E3FD] px-2 py-0.5 rounded-full inline-block mb-1">
                  {platformTab === 'ios' ? 'iOS Home Screen App' : 'Android WebAPK App'}
                </span>
                <h3 className="text-lg font-bold text-[#1F1F1F]">
                  {platformTab === 'ios'
                    ? 'Add Numi to Your iPhone Home Screen'
                    : 'Run Numi as a Native Android App'}
                </h3>
                <p className="text-xs text-[#444746] mt-1 leading-relaxed">
                  {platformTab === 'ios'
                    ? 'Install Numi on iOS for full-screen view, standalone app switching, haptic tactile clicks, and zero browser bars.'
                    : 'Install Numi directly on your Android device with offline support, Material You UI, adaptive launcher icons, and system haptics.'}
                </p>
              </div>
              <NumiLogo variant="badge" size={60} className="hidden sm:flex shrink-0 shadow-sm" />
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2 p-2 bg-[#F0F4F9] rounded-xl text-[#041E49]">
                <Zap size={15} className="text-[#0B57D0] shrink-0" />
                <span className="font-semibold text-[11px]">Instant Offline Access</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#F0F4F9] rounded-xl text-[#041E49]">
                <ShieldCheck size={15} className="text-[#146C2E] shrink-0" />
                <span className="font-semibold text-[11px]">100% Private &amp; Local</span>
              </div>
            </div>

            {/* One-Tap Install Action (Active on Android/Chromium) */}
            {platformTab === 'android' && (
              <div className="pt-2">
                {isInstalled ? (
                  <div className="w-full py-3 bg-[#146C2E]/10 border border-[#146C2E]/30 rounded-xl text-[#146C2E] flex items-center justify-center gap-2 text-sm font-semibold">
                    <CheckCircle2 size={18} />
                    <span>Numi is installed on this device</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-[#0B57D0] hover:bg-[#1A73E8] text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Sparkles size={16} />
                    <span>{isInstallable ? 'Install to Android Device' : 'Install Android App'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* iOS Safari Instructions */}
          {platformTab === 'ios' && (
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] space-y-3">
              <h4 className="text-xs font-bold text-[#444746] uppercase tracking-wider flex items-center gap-1.5">
                <span>🍎</span>
                <span>How to Install on iPhone &amp; iPad Safari</span>
              </h4>

              <div className="space-y-2.5 text-xs text-[#1F1F1F]">
                <div className="flex items-start gap-2.5 p-2.5 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold">Open in Apple Safari</p>
                    <p className="text-[11px] text-[#444746]">
                      Make sure you are browsing in Safari on your iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <span>Tap the Safari Share button</span>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#E0E2EC] rounded text-[#0B57D0] text-[11px]">
                        📤
                      </span>
                    </p>
                    <p className="text-[11px] text-[#444746]">
                      Located at the bottom of the screen on iPhone, or top-right on iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <span>Select &quot;Add to Home Screen&quot;</span>
                      <span className="inline-flex items-center justify-center w-4 h-4 bg-[#E0E2EC] rounded text-[#1F1F1F] text-[10px]">
                        ➕
                      </span>
                    </p>
                    <p className="text-[11px] text-[#444746]">
                      Scroll down in the share sheet, tap <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>&quot;Add&quot;</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#E8F0FE] rounded-xl text-[11px] text-[#041E49] leading-relaxed">
                🎉 Numi will appear on your home screen with its custom icon. Tap it to launch full-screen with instant offline loading!
              </div>
            </div>
          )}

          {/* Android Chrome Instructions */}
          {platformTab === 'android' && (
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] space-y-3">
              <h4 className="text-xs font-bold text-[#444746] uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span>
                <span>Installation Steps for Android</span>
              </h4>

              <div className="space-y-2.5 text-xs text-[#1F1F1F]">
                <div className="flex items-start gap-2.5 p-2 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold">Open in Chrome or Samsung Internet</p>
                    <p className="text-[11px] text-[#444746]">
                      Navigate to this URL on your Android smartphone browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold">Tap the Browser Menu (⋮)</p>
                    <p className="text-[11px] text-[#444746]">
                      Tap the three vertical dots located in the top-right or bottom-right corner.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 bg-[#F0F4F9] rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#0B57D0] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold">Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</p>
                    <p className="text-[11px] text-[#444746]">
                      Android will generate a high-res launcher icon and add it to your App Drawer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Share to Mobile Device */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E0E2EC] flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#1F1F1F]">Share Numi Link</p>
              <p className="text-[11px] text-[#444746]">
                Send link to your iPhone, iPad, or Android phone via AirDrop, WhatsApp, or Email.
              </p>
            </div>
            <button
              type="button"
              onClick={handleShareLink}
              className="px-3.5 py-2 bg-[#F0F4F9] hover:bg-[#E0E2EC] text-[#0B57D0] rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              {copiedLink ? <Check size={14} className="text-[#146C2E]" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0E2EC] bg-[#F0F4F9] flex justify-end">
          <button
            type="button"
            onClick={() => {
              tap('light');
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0B57D0] hover:bg-[#1A73E8] rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
