'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import AppHeader from './AppHeader';

/**
 * Smart header for public pages (help, terms, privacy, inspiration, vendor profiles, marketplace, AI planner).
 * Shows AppHeader if logged in, or a simple branded header with nav links if not.
 */
export default function PublicHeader() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (user) return <AppHeader />;

  const navLinks = [
    { href: '/marketplace', icon: Search, label: 'Discover' },
    { href: '/plan-my-event', icon: Sparkles, label: 'AI Planner' },
  ];

  // Unauthenticated — simple branded header with nav
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/marketplace" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base hidden sm:inline">Event Nest</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
