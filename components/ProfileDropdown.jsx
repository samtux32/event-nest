'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LogOut, Settings, HelpCircle, FileText, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import ConfirmModal from './ConfirmModal';

export default function ProfileDropdown() {
  const { profile, signOut, isVendor, activeMode, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isVendorMode = activeMode === 'vendor' || isVendor;
  const settingsUrl = isVendorMode ? '/vendor-settings' : '/customer-settings';
  const displayName = isVendorMode
    ? (profile?.businessName || profile?.fullName || 'Vendor')
    : (profile?.fullName || profile?.businessName || 'Customer');
  const email = profile?.email || '';
  const initial = displayName[0]?.toUpperCase() || email[0]?.toUpperCase() || '?';
  const avatarUrl = profile?.profileImageUrl || profile?.avatarUrl;

  const links = [
    { href: settingsUrl, icon: Settings, label: 'Account Information' },
    { href: '/help', icon: HelpCircle, label: 'Help & FAQ' },
    { href: '/terms', icon: FileText, label: 'Terms of Service' },
    { href: '/privacy', icon: Shield, label: 'Privacy Policy' },
  ];

  return (
    <div className="relative" ref={ref}>
      {loading || !profile ? (
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
          )}
        </button>
      )}

      {open && (
        <div className="fixed left-2 right-2 top-16 z-50 md:absolute md:left-auto md:right-0 md:top-12 md:w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header: avatar + name + email */}
          <div className="flex items-center gap-3 px-4 py-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Links */}
          <div className="py-1">
            {links.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon size={16} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {/* Sign Out */}
          <button
            onClick={() => { setOpen(false); setShowLogoutConfirm(true); }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      {showLogoutConfirm && (
        <ConfirmModal
          title="Sign out?"
          message="Are you sure you want to sign out of your account?"
          confirmLabel="Sign Out"
          onConfirm={() => { setShowLogoutConfirm(false); signOut(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
