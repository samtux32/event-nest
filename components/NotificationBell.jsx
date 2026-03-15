'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, WifiOff } from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const ref = useRef(null);
  const failCountRef = useRef(0);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30s, but only when tab is visible and pause on repeated failures
    let interval;
    function startPolling() {
      clearInterval(interval);
      const delay = Math.min(30000 * Math.pow(2, failCountRef.current), 300000); // backoff up to 5min
      interval = setInterval(() => {
        if (!document.hidden) fetchNotifications();
      }, delay);
    }
    startPolling();

    // Re-fetch immediately when tab becomes visible again
    function handleVisibility() {
      if (!document.hidden) {
        fetchNotifications();
        failCountRef.current = 0;
        startPolling();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setFetchError(false);
        failCountRef.current = 0;
      } else {
        failCountRef.current++;
        setFetchError(true);
      }
    } catch {
      failCountRef.current++;
      setFetchError(true);
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markRead(id) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  const handleBellClick = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && unreadCount > 0) {
      markAllRead();
    }
    // Retry fetch if in error state
    if (opening && fetchError) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed left-2 right-2 top-16 z-50 md:absolute md:left-auto md:right-0 md:top-12 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {fetchError ? (
              <div className="text-center py-8 px-4">
                <WifiOff className="mx-auto text-gray-300 mb-2" size={24} />
                <p className="text-gray-500 text-sm mb-2">Couldn't load notifications</p>
                <button
                  onClick={fetchNotifications}
                  className="text-purple-600 text-sm font-medium hover:underline"
                >
                  Tap to retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-purple-50' : ''}`}
                >
                  {n.link ? (
                    <Link href={n.link} className="block">
                      <p className={`text-sm font-medium text-gray-900 ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </Link>
                  ) : (
                    <>
                      <p className={`text-sm text-gray-900 ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
