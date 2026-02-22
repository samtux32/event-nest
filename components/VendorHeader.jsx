'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';

export default function VendorHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vendorProfileId, setVendorProfileId] = useState(null);

  useEffect(() => {
    fetch('/api/vendors/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setVendorProfileId(data.id); })
      .catch(() => {});
  }, []);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base">Event Nest</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
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
            href={`/vendor-profile/${vendorProfileId || profile?.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
            title="View your public profile"
          >
            <ExternalLink size={14} />
            View Profile
          </Link>
          <NotificationBell />
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.businessName || 'Profile'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initial}
            </div>
          )}
          <button onClick={signOut} className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors" title="Sign out">
            <LogOut size={18} />
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          <Link
            href={`/vendor-profile/${vendorProfileId || profile?.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={18} />
            View Public Profile
          </Link>
          <button
            onClick={() => { signOut(); setMobileOpen(false); }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
