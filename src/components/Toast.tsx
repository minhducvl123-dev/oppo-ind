import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastInfo } from '../types';

interface ToastProps {
  toasts: ToastInfo[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((t) => {
        let Icon = CheckCircle2;
        let bgClass = 'bg-slate-900 border-emerald-500/30 text-white';
        let iconColor = 'text-emerald-400';

        if (t.type === 'error') {
          Icon = AlertCircle;
          bgClass = 'bg-rose-950 border-rose-500/40 text-rose-50';
          iconColor = 'text-rose-400';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          bgClass = 'bg-amber-950 border-amber-500/40 text-amber-50';
          iconColor = 'text-amber-400';
        } else if (t.type === 'info') {
          Icon = Info;
          bgClass = 'bg-blue-950 border-blue-500/40 text-blue-50';
          iconColor = 'text-blue-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgClass}`}
          >
            <div className="flex items-center space-x-2.5">
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <p className="text-xs sm:text-sm font-medium leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="ml-3 p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
