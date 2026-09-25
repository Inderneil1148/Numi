import React from 'react';
import { Globe, MessageSquare, Trash2, Camera, MousePointerClick, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { NumiLogo } from './NumiLogo';

interface AndroidRecentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: () => void;
}

export const AndroidRecentsModal: React.FC<AndroidRecentsModalProps> = ({
  isOpen,
  onClose,
  onSelectApp,
}) => {
  const { tap, success } = useHaptics();

  if (!isOpen) return null;

  const handleClearAll = () => {
    tap('medium');
    success();
    onClose();
  };

  const handleResumeNumi = () => {
    tap('light');
    onSelectApp();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#121316]/90 text-white flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <span className="text-xs font-semibold text-white/70">Recent Apps</span>
        <button
          type="button"
          onClick={() => {
            tap('light');
            onClose();
          }}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Multitasking Card Carousel */}
      <div className="flex items-center justify-center gap-3 overflow-hidden py-4">
        {/* Left card peek: Chrome */}
        <div className="w-14 sm:w-20 h-64 bg-white/10 rounded-2xl p-2 shrink-0 opacity-40 scale-90 flex flex-col items-center justify-center">
          <Globe size={24} className="text-[#A8C7FA]" />
          <span className="text-[10px] mt-2 text-white/60">Chrome</span>
        </div>

        {/* Center active card: Numi */}
        <div
          onClick={handleResumeNumi}
          className="w-64 sm:w-72 h-84 bg-[#F0F4F9] text-[#1F1F1F] rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-pointer border-2 border-[#0B57D0] transition-transform hover:scale-[1.02] active:scale-98"
        >
          {/* Card Header */}
          <div className="flex items-center gap-2">
            <NumiLogo variant="badge" size={24} />
            <span className="text-xs font-bold text-[#1F1F1F]">Numi</span>
          </div>

          {/* Mini snapshot preview */}
          <div className="flex-1 my-3 bg-white rounded-xl p-3 border border-[#E0E2EC] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="text-[10px] text-[#444746] font-medium">Net Balance</div>
              <div className="text-lg font-bold text-[#0B57D0]">Active Ledger</div>
              <div className="w-full h-1.5 bg-[#E0E2EC] rounded-full my-2">
                <div className="w-3/5 h-full bg-[#0B57D0] rounded-full" />
              </div>
            </div>
            <div className="text-[10px] text-[#444746] text-center font-medium bg-[#F0F4F9] py-1 rounded-lg">
              Tap to return to app
            </div>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-semibold text-[#0B57D0]">Tap to resume</span>
          </div>
        </div>

        {/* Right card peek: Messages */}
        <div className="w-14 sm:w-20 h-64 bg-white/10 rounded-2xl p-2 shrink-0 opacity-40 scale-90 flex flex-col items-center justify-center">
          <MessageSquare size={24} className="text-[#7FCFFF]" />
          <span className="text-[10px] mt-2 text-white/60">Messages</span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-around px-4 pb-2">
        <button
          type="button"
          onClick={() => {
            tap('light');
            alert('Screenshot saved to Photos');
          }}
          className="flex flex-col items-center gap-1 text-[11px] text-white/80 hover:text-white cursor-pointer"
        >
          <Camera size={16} />
          <span>Screenshot</span>
        </button>

        <button
          type="button"
          onClick={handleClearAll}
          className="px-5 py-2 bg-white/15 hover:bg-white/25 rounded-full text-xs font-semibold text-white cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Trash2 size={13} />
          <span>Clear all</span>
        </button>

        <button
          type="button"
          onClick={handleResumeNumi}
          className="flex flex-col items-center gap-1 text-[11px] text-white/80 hover:text-white cursor-pointer"
        >
          <MousePointerClick size={16} />
          <span>Select</span>
        </button>
      </div>
    </div>
  );
};
