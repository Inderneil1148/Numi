import React, { useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Flashlight,
  Volume2,
  VolumeX,
  RotateCw,
  CreditCard,
  Bell,
  ChevronUp,
  Sliders,
  Check,
} from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { NumiLogo } from './NumiLogo';

interface AndroidQuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  onOpenWallet: () => void;
  currencySymbol: string;
  monthlyBudget: number;
  totalExpense: number;
}

export const AndroidQuickSettings: React.FC<AndroidQuickSettingsProps> = ({
  isOpen,
  onClose,
  onOpenAddModal,
  onOpenWallet,
  currencySymbol,
  monthlyBudget,
  totalExpense,
}) => {
  const { tap, selection } = useHaptics();

  // Quick Tile States
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [soundMode, setSoundMode] = useState<'ring' | 'vibrate' | 'silent'>('vibrate');
  const [brightness, setBrightness] = useState(82);

  if (!isOpen) return null;

  const toggleTile = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    selection();
    setter((prev) => !prev);
  };

  const remainingBudget = Math.max(0, monthlyBudget - totalExpense);

  return (
    <div className="absolute inset-0 z-50 bg-[#121316]/95 text-white flex flex-col backdrop-blur-xl animate-in slide-in-from-top-6 duration-250 select-none overflow-hidden rounded-t-[36px]">
      {/* Top Bar: Time, Date & Quick Info */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
        <div>
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>9:30</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#0B57D0] text-white font-semibold">
              Android 15
            </span>
          </div>
          <div className="text-xs text-white/60 font-medium">Thursday, Sep 25</div>
        </div>

        <button
          type="button"
          onClick={() => {
            tap('light');
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
          title="Close Notification Shade"
        >
          <ChevronUp size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Material You Quick Tiles Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Tile 1: Internet */}
          <button
            type="button"
            onClick={() => toggleTile(setWifiEnabled)}
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
              wifiEnabled
                ? 'bg-[#D3E3FD] text-[#041E49] font-semibold'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <div className={`p-2 rounded-xl ${wifiEnabled ? 'bg-[#0B57D0] text-white' : 'bg-white/10'}`}>
              <Wifi size={18} />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold leading-tight">Internet</div>
              <div className="text-[10px] opacity-80 truncate">
                {wifiEnabled ? 'Pixel_Wi-Fi 6' : 'Off'}
              </div>
            </div>
          </button>

          {/* Tile 2: Bluetooth */}
          <button
            type="button"
            onClick={() => toggleTile(setBluetoothEnabled)}
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
              bluetoothEnabled
                ? 'bg-[#D3E3FD] text-[#041E49] font-semibold'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <div className={`p-2 rounded-xl ${bluetoothEnabled ? 'bg-[#0B57D0] text-white' : 'bg-white/10'}`}>
              <Bluetooth size={18} />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold leading-tight">Bluetooth</div>
              <div className="text-[10px] opacity-80 truncate">
                {bluetoothEnabled ? 'Pixel Buds' : 'Off'}
              </div>
            </div>
          </button>

          {/* Tile 3: Flashlight */}
          <button
            type="button"
            onClick={() => toggleTile(setFlashlight)}
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
              flashlight
                ? 'bg-[#D3E3FD] text-[#041E49] font-semibold'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <div className={`p-2 rounded-xl ${flashlight ? 'bg-[#0B57D0] text-white' : 'bg-white/10'}`}>
              <Flashlight size={18} />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold leading-tight">Flashlight</div>
              <div className="text-[10px] opacity-80">{flashlight ? 'On' : 'Off'}</div>
            </div>
          </button>

          {/* Tile 4: Dark Theme */}
          <button
            type="button"
            onClick={() => toggleTile(setDarkTheme)}
            className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
              darkTheme
                ? 'bg-[#D3E3FD] text-[#041E49] font-semibold'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <div className={`p-2 rounded-xl ${darkTheme ? 'bg-[#0B57D0] text-white' : 'bg-white/10'}`}>
              <Moon size={18} />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold leading-tight">Dark Theme</div>
              <div className="text-[10px] opacity-80">{darkTheme ? 'On' : 'Off'}</div>
            </div>
          </button>
        </div>

        {/* Brightness Slider */}
        <div className="p-3 bg-white/5 rounded-2xl flex items-center gap-3">
          <Sun size={18} className="text-white/60 shrink-0" />
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-[#0B57D0] cursor-pointer"
          />
          <span className="text-xs font-semibold text-white/70 w-8 text-right tabular-nums">
            {brightness}%
          </span>
        </div>

        {/* Android System Notifications */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-white/50 tracking-wider uppercase px-1">
            <span>Notifications</span>
            <span className="text-[10px] text-[#A8C7FA] lowercase font-normal">silent notifications (1)</span>
          </div>

          {/* Numi Notification Card */}
          <div className="p-3.5 bg-white/10 rounded-2xl space-y-2.5 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NumiLogo variant="badge" size={22} />
                <span className="text-xs font-bold text-white">Numi</span>
                <span className="text-[10px] text-white/50">• Just now</span>
              </div>
              <span className="text-[10px] font-semibold bg-[#0B57D0]/40 text-[#D3E3FD] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Monthly Budget on Track: {currencySymbol}{remainingBudget.toLocaleString()} left
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Total spent: {currencySymbol}{totalExpense.toLocaleString()} of {currencySymbol}{monthlyBudget.toLocaleString()}.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  onOpenWallet();
                  onClose();
                }}
                className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full text-xs font-semibold cursor-pointer transition-colors"
              >
                View Ledger
              </button>
              <button
                type="button"
                onClick={() => {
                  tap('medium');
                  onClose();
                  onOpenAddModal();
                }}
                className="px-3 py-1 bg-[#0B57D0] hover:bg-[#1A73E8] text-white rounded-full text-xs font-semibold cursor-pointer transition-colors"
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Drag Handle & Close */}
      <div
        onClick={() => {
          tap('light');
          onClose();
        }}
        className="py-3 flex justify-center cursor-pointer hover:bg-white/5 transition-colors border-t border-white/5"
      >
        <div className="w-12 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};
