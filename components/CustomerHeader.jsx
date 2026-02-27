'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, MessageSquare, Heart, Menu, X, Sparkles, CheckSquare, Lightbulb, FolderOpen, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import ModeToggle from './ModeToggle';

export default function CustomerHeader() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close More dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const mainLinks = [
    { href: '/marketplace', icon: Search, label: 'Discover' },
    { href: '/my-bookings', icon: null, label: 'Bookings' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/plan-my-event', icon: Sparkles, label: 'AI Planner' },
    { href: '/customer-messages', icon: MessageSquare, label: 'Messages' },
  ];

  const moreLinks = [
    { href: '/my-plans', icon: FolderOpen, label: 'My Plans' },
    { href: '/event-checklist', icon: CheckSquare, label: 'Checklist' },
    { href: '/inspiration', icon: Lightbulb, label: 'Inspiration' },
  ];

  const allLinks = [...mainLinks, ...moreLinks];
  const moreActive = moreLinks.some(l => pathname === l.href);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/marketplace" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-gray-900 text-base">Event Nest</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {mainLinks.map(({ href, icon: Icon, label }) => {
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
                {Icon && <Icon size={16} />}
                {label}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                moreActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              More
              <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                {moreLinks.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
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
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ModeToggle />
          <NotificationBell />
          <ProfileDropdown />

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
          <div className="flex justify-center py-2">
            <ModeToggle mobile />
          </div>
          {allLinks.map(({ href, icon: Icon, label }) => {
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
                {Icon && <Icon size={18} />}
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
