'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  User,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';

export default function VendorHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const initial = profile?.businessName?.[0] || profile?.email?.[0]?.toUpperCase() || 'V';

  const navLinks = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/profile-editor', icon: User, label: 'Profile' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/vendor-settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base">Event Nest</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/vendor-profile/${profile?.id || ''}`}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
            title="Preview your public profile"
          >
            <ExternalLink size={14} />
            Preview
          </Link>
          <NotificationBell />
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {initial}
          </div>
          <button onClick={signOut} className="text-gray-400 hover:text-gray-600 transition-colors" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  );
}
