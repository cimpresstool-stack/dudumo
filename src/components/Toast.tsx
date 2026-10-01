import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-teal-400';
        let Icon = CheckCircle2;
        let iconColor = 'text-teal-400';

        if (toast.kind === 'err') {
          borderClass = 'border-l-4 border-l-rose-500';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.kind === 'info') {
          borderClass = 'border-l-4 border-l-cyan-400';
          Icon = Info;
          iconColor = 'text-cyan-400';
        } else if (toast.kind === 'gold') {
          borderClass = 'border-l-4 border-l-amber-400';
          Icon = Sparkles;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 bg-[#0B0710]/95 backdrop-blur-md text-white px-4 py-3.5 rounded-xl shadow-2xl text-sm font-medium border border-white/10 ${borderClass} transition-all duration-300 animate-in fade-in slide-in-from-right-4`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
