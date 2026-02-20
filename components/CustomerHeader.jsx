'use client';

import React from 'react';
import Link from 'next/link';
import { Search, MessageSquare, LogOut, Heart, Settings } from 'lucide-react';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';

export default function CustomerHeader() {
  const { profile, signOut } = useAuth();
  const initial = profile?.fullName?.[0] || profile?.email?.[0]?.toUpperCase() || 'C';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/marketplace" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base">Event Nest</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link href="/marketplace" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Search size={16} />
            Discover
          </Link>
          <Link href="/my-bookings" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            Bookings
          </Link>
          <Link href="/wishlist" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Heart size={16} />
            Wishlist
          </Link>
          <Link href="/customer-messages" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <MessageSquare size={16} />
            Messages
          </Link>
          <Link href="/customer-settings" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Settings size={16} />
            Settings
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <NotificationBell />
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName || 'Profile'}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
          )}
          <button onClick={signOut} className="text-gray-400 hover:text-gray-600 transition-colors" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  );
}
