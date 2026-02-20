'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  User,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';

export default function VendorHeader() {
  const { profile, signOut } = useAuth();
  const initial = profile?.businessName?.[0] || profile?.email?.[0]?.toUpperCase() || 'V';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-16 h-16 rounded-xl object-cover" />
            <div className="font-bold text-lg leading-tight">Event<br/>Nest</div>
          </div>

          <nav className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link href="/analytics" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <TrendingUp size={20} />
              Analytics
            </Link>
            <Link href="/calendar" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Calendar size={20} />
              Calendar
            </Link>
            <Link href="/profile-editor" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <User size={20} />
              Profile
            </Link>
            <Link href="/messages" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <MessageSquare size={20} />
              Messages
            </Link>
            <Link href="/vendor-settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Settings size={20} />
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={`/vendor-profile/${profile?.id || ''}`} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
              Preview Profile
            </Link>
            {profile?.businessName && (
              <span className="text-sm text-gray-700 font-medium">{profile.businessName}</span>
            )}
            <NotificationBell />
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
