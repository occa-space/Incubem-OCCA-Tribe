import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export interface ToastNotificationData {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface ToastNotificationProps {
  notification: ToastNotificationData;
}

export default function ToastNotification({ notification }: ToastNotificationProps) {
  return (
    <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300 pointer-events-none">
      <div
        className={`
          flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-l-4 min-w-[300px]
          ${notification.type === 'success' ? 'bg-slate-800 border-green-500 text-white' : ''}
          ${notification.type === 'error' ? 'bg-slate-800 border-red-500 text-white' : ''}
          ${notification.type === 'info' ? 'bg-slate-800 border-blue-500 text-white' : ''}
        `}
      >
        <div
          className={`p-2 rounded-full 
            ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
            ${notification.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
            ${notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
          `}
        >
          {notification.type === 'success' && <CheckCircle2 size={20} />}
          {notification.type === 'error' && <AlertTriangle size={20} />}
          {notification.type === 'info' && <Info size={20} />}
        </div>
        <div>
          <div className="font-bold text-sm uppercase mb-0.5 opacity-80">
            {notification.type === 'success' ? 'Sucesso' : notification.type === 'error' ? 'Atenção' : 'Info'}
          </div>
          <div className="font-medium text-sm">{notification.message}</div>
        </div>
      </div>
    </div>
  );
}
