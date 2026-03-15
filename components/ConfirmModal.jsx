'use client';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, destructive = true }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${destructive ? 'bg-red-100' : 'bg-purple-100'}`}>
            <AlertTriangle size={24} className={destructive ? 'text-red-600' : 'text-purple-600'} />
          </div>
          <h3 id="confirm-modal-title" className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
