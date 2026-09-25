import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Sparkles, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { NumiLogo } from './NumiLogo';

interface AndroidInstallBannerProps {
  onOpenApkModal?: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({ onOpenApkModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { tap, success } = useHaptics();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    tap('medium');
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        success();
        return;
      }
    }
    if (onOpenApkModal) {
      onOpenApkModal();
    }
  };

  return (
    <div className="w-full bg-[#E8F0FE] border-b border-[#D3E3FD] px-4 py-2.5 flex items-center justify-between gap-3 text-[#041E49] transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <NumiLogo variant="badge" size={32} />
        <div className="min-w-0">
          <p className="text-xs font-bold truncate flex items-center gap-1.5">
            <span>Install Numi App</span>
            <span className="text-[10px] font-semibold bg-[#D3E3FD] px-1.5 py-0.5 rounded-full text-[#0B57D0]">
              iOS &amp; Android
            </span>
          </p>
          <p className="text-[11px] text-[#444746] truncate">
            Add to your iPhone, iPad, or Android home screen for instant offline access
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-full bg-[#0B57D0] hover:bg-[#1A73E8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <Sparkles size={13} />
          <span>{isInstallable ? 'Install App' : isIOS ? 'Install on iOS' : 'Install App'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            tap('light');
            setIsDismissed(true);
          }}
          className="p-1 rounded-full text-[#444746] hover:bg-black/5 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
