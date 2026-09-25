import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface SnackbarMessage {
  id: string;
  text: string;
  type?: 'success' | 'warning' | 'info';
}

interface AndroidSnackbarProps {
  message: SnackbarMessage | null;
  onDismiss: () => void;
}

export const AndroidSnackbar: React.FC<AndroidSnackbarProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <aside
      aria-label="Notification alert"
      aria-live="polite"
      className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] sm:w-auto min-w-[280px] bg-[#1F1F1F] text-[#F0F4F9] px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {message.type === 'success' && (
          <CheckCircle2 size={18} className="text-[#80C993] shrink-0" />
        )}
        {message.type === 'warning' && (
          <AlertCircle size={18} className="text-[#FFB4AB] shrink-0" />
        )}
        {(!message.type || message.type === 'info') && (
          <Info size={18} className="text-[#A8C7FA] shrink-0" />
        )}
        <span className="text-xs font-medium tracking-tight truncate">{message.text}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-full text-[#C4C7C5] hover:text-white hover:bg-white/10 transition-colors shrink-0"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </aside>
  );
};
