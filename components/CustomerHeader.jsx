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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-16 h-16 rounded-xl object-cover" />
            <div className="font-bold text-lg leading-tight">Event<br/>Nest</div>
          </div>

          <nav className="flex items-center gap-8">
            <Link href="/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Search size={20} />
              Discover
            </Link>
            <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900">Bookings</Link>
            <Link href="/wishlist" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Heart size={20} />
              Wishlist
            </Link>
            <Link href="/customer-messages" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <MessageSquare size={20} />
              Messages
            </Link>
            <Link href="/customer-settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Settings size={20} />
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <NotificationBell />
            {profile?.fullName && (
              <span className="text-sm text-gray-700 font-medium">{profile.fullName}</span>
            )}
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {initial}
            </div>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-600" title="Sign out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
