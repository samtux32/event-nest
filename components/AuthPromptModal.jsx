'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function AuthPromptModal({ message, redirectTo, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!mounted) return null;

  const encodedRedirect = encodeURIComponent(redirectTo);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign up to get started</h2>
        <p className="text-gray-600 mb-6">You need an account to {message}.</p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/register?redirectTo=${encodedRedirect}`}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-purple-700 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href={`/login?redirectTo=${encodedRedirect}`}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
