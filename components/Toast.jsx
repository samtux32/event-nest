'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const BG = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
};

let toastId = 0;

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300 ${BG[toast.type] || BG.info} ${
        exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
    >
      {ICONS[toast.type] || ICONS.info}
      <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="p-0.5 hover:bg-black/5 rounded transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} className="text-gray-400" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, opts = {}) => {
    return addToast(message, opts.type || 'info', opts.duration || 4000);
  }, [addToast]);

  toast.success = (msg, opts) => addToast(msg, 'success', opts?.duration || 4000);
  toast.error = (msg, opts) => addToast(msg, 'error', opts?.duration || 5000);
  toast.warning = (msg, opts) => addToast(msg, 'warning', opts?.duration || 4000);
  toast.info = (msg, opts) => addToast(msg, 'info', opts?.duration || 4000);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {mounted && createPortal(
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[10000] flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
