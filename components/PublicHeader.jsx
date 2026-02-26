'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import AppHeader from './AppHeader';

/**
 * Smart header for public pages (help, terms, privacy, inspiration, vendor profiles).
 * Shows AppHeader if logged in, or a simple branded header if not.
 */
export default function PublicHeader() {
  const { user } = useAuth();

  if (user) return <AppHeader />;

  // Unauthenticated — simple branded header
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base">Event Nest</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
