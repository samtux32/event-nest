'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, CheckSquare, FolderOpen, ChevronDown, ChevronUp, MapPin, Clock, Users, Star } from 'lucide-react';

function StatusBadge({ status }) {
  const colors = {
    new_inquiry: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function MyEvents() {
  const [plans, setPlans] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/api/saved-plans').then(r => r.json()).then(d => d.plans || []).catch(() => []),
      fetch('/api/checklists').then(r => r.json()).then(d => d.checklists || []).catch(() => []),
      fetch('/api/bookings?limit=100').then(r => r.json()).then(d => d.bookings || []).catch(() => []),
    ]).then(([p, c, b]) => {
      setPlans(p);
      setChecklists(c);
      setBookings(b);
      setLoading(false);
    });
  }, []);

  // Group items into events by matching plan title ↔ checklist name, and booking eventType overlap
  const events = groupIntoEvents(plans, checklists, bookings);

  const toggleExpand = (id) => {
    setExpandedEvents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Events</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = events.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Events</h1>
      <p className="text-gray-500 text-sm mb-6">All your plans, checklists, and bookings in one place.</p>

      {isEmpty ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No events yet</h2>
          <p className="text-gray-500 mb-6">Start planning your first event!</p>
          <div className="flex gap-3 justify-center">
            <Link href="/plan-my-event" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
              AI Planner
            </Link>
            <Link href="/marketplace" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Browse Vendors
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const expanded = expandedEvents[event.id] !== false; // default expanded
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => toggleExpand(event.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {event.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {event.plans.length > 0 && (
                        <span className="flex items-center gap-1"><FolderOpen size={12} /> {event.plans.length} plan{event.plans.length !== 1 ? 's' : ''}</span>
                      )}
                      {event.checklists.length > 0 && (
                        <span className="flex items-center gap-1"><CheckSquare size={12} /> {event.checklists.length} checklist{event.checklists.length !== 1 ? 's' : ''}</span>
                      )}
                      {event.bookings.length > 0 && (
                        <span className="flex items-center gap-1"><Users size={12} /> {event.bookings.length} booking{event.bookings.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {/* Body */}
                {expanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Plans */}
                    {event.plans.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plans</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {event.plans.map(plan => (
                            <Link
                              key={plan.id}
                              href="/my-plans"
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                            >
                              <FolderOpen size={16} className="text-purple-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{plan.title}</p>
                                {plan.totalBudget && (
                                  <p className="text-xs text-gray-500">Budget: £{Number(plan.totalBudget).toLocaleString('en-GB')}</p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklists */}
                    {event.checklists.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Checklists</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {event.checklists.map(cl => {
                            const total = cl.items?.length || 0;
                            const done = cl.items?.filter(i => i.completed).length || 0;
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                            return (
                              <Link
                                key={cl.id}
                                href="/event-checklist"
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                              >
                                <CheckSquare size={16} className="text-green-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{cl.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500">{done}/{total}</span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bookings */}
                    {event.bookings.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bookings</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {event.bookings.map(b => (
                            <Link
                              key={b.id}
                              href="/my-bookings"
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                {b.vendor?.profileImageUrl ? (
                                  <img src={b.vendor.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-purple-600">{b.vendor?.businessName?.[0] || 'V'}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{b.vendor?.businessName || 'Vendor'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StatusBadge status={b.status} />
                                  {b.package?.name && <span className="text-xs text-gray-500 truncate">{b.package.name}</span>}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Group plans, checklists, and bookings into logical "events"
function groupIntoEvents(plans, checklists, bookings) {
  const events = [];
  const usedPlanIds = new Set();
  const usedChecklistIds = new Set();
  const usedBookingIds = new Set();

  // Helper: normalize string for fuzzy matching
  const norm = (s) => (s || '').toLowerCase().trim();

  // First pass: group plans + checklists by matching title ↔ name
  for (const plan of plans) {
    const event = {
      id: `plan-${plan.id}`,
      name: plan.title || 'Untitled Event',
      date: null,
      plans: [plan],
      checklists: [],
      bookings: [],
    };
    usedPlanIds.add(plan.id);

    // Find matching checklists
    for (const cl of checklists) {
      if (usedChecklistIds.has(cl.id)) continue;
      if (norm(cl.name) === norm(plan.title) || norm(cl.name).includes(norm(plan.title)) || norm(plan.title).includes(norm(cl.name))) {
        event.checklists.push(cl);
        usedChecklistIds.add(cl.id);
      }
    }

    // Find matching bookings by event type overlap
    const planWords = norm(plan.title).split(/\s+/);
    for (const b of bookings) {
      if (usedBookingIds.has(b.id)) continue;
      const eventTypeNorm = norm(b.eventType);
      if (eventTypeNorm && planWords.some(w => w.length > 3 && eventTypeNorm.includes(w))) {
        event.bookings.push(b);
        usedBookingIds.add(b.id);
        if (!event.date && b.eventDate) event.date = b.eventDate;
      }
    }

    events.push(event);
  }

  // Second pass: standalone checklists
  for (const cl of checklists) {
    if (usedChecklistIds.has(cl.id)) continue;
    const event = {
      id: `checklist-${cl.id}`,
      name: cl.name || 'Untitled Checklist',
      date: null,
      plans: [],
      checklists: [cl],
      bookings: [],
    };
    usedChecklistIds.add(cl.id);

    // Try to match bookings
    const clWords = norm(cl.name).split(/\s+/);
    for (const b of bookings) {
      if (usedBookingIds.has(b.id)) continue;
      const eventTypeNorm = norm(b.eventType);
      if (eventTypeNorm && clWords.some(w => w.length > 3 && eventTypeNorm.includes(w))) {
        event.bookings.push(b);
        usedBookingIds.add(b.id);
        if (!event.date && b.eventDate) event.date = b.eventDate;
      }
    }

    events.push(event);
  }

  // Third pass: ungrouped bookings
  const ungroupedBookings = bookings.filter(b => !usedBookingIds.has(b.id));
  if (ungroupedBookings.length > 0) {
    // Group by eventType
    const byType = {};
    for (const b of ungroupedBookings) {
      const key = b.eventType || 'Other';
      if (!byType[key]) byType[key] = [];
      byType[key].push(b);
    }

    for (const [type, bks] of Object.entries(byType)) {
      events.push({
        id: `bookings-${type}`,
        name: type === 'Other' ? 'Other Bookings' : type,
        date: bks[0]?.eventDate || null,
        plans: [],
        checklists: [],
        bookings: bks,
      });
    }
  }

  return events;
}
