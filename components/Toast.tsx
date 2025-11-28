
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastNotification } from '../types';
import { useSettings } from './SettingsContext';

interface ToastContextType {
  notifications: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const { notificationsEnabled } = useSettings();

  const removeToast = useCallback((id: string) => {
    // We don't remove from history, we just hide the floating toast?
    // For simplicity, let's keep all in 'notifications' state but only render "recent" ones as floating toasts.
    // Actually, let's separate "Active Toasts" (visual) from "History".
    // But to keep it simple, we'll just use one list. 
    // Wait, the prompt wants a history.
    // So we never "remove" from the state completely unless user clears history.
  }, []);
  
  // However, for the visual "Toast" popping up, we need a mechanism to hide it after few seconds.
  // We can track visible IDs.
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!notificationsEnabled) return;

    const id = Date.now().toString();
    const newNote: ToastNotification = { 
        id, 
        message, 
        type, 
        timestamp: Date.now(),
        read: false 
    };

    setNotifications(prev => [newNote, ...prev]);
    setVisibleIds(prev => [...prev, id]);
    
    // Auto hide visual toast after 4 seconds
    setTimeout(() => {
      setVisibleIds(prev => prev.filter(vid => vid !== id));
    }, 4000);
  }, [notificationsEnabled]);

  const markAllAsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
      setNotifications([]);
      setVisibleIds([]);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ToastContext.Provider value={{ 
        notifications, 
        addToast, 
        removeToast: (id) => setVisibleIds(prev => prev.filter(vid => vid !== id)), // Only hides it
        markAllAsRead, 
        clearAll,
        unreadCount 
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.filter(n => visibleIds.includes(n.id)).map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 min-w-[300px] px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-full duration-300 pointer-events-auto
              ${toast.type === 'success' ? 'bg-slate-900/90 border-green-500/30 text-green-100 shadow-green-500/10' : ''}
              ${toast.type === 'error' ? 'bg-slate-900/90 border-red-500/30 text-red-100 shadow-red-500/10' : ''}
              ${toast.type === 'info' ? 'bg-slate-900/90 border-slate-700 text-slate-100' : ''}
            `}
          >
            <div className={`
               p-1.5 rounded-full
               ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
               ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
               ${toast.type === 'info' ? 'bg-slate-700 text-slate-400' : ''}
            `}>
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <p className="text-sm font-medium flex-grow">{toast.message}</p>
            <button 
              onClick={() => setVisibleIds(prev => prev.filter(vid => vid !== toast.id))}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
