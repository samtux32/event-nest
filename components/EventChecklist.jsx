'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, ChevronDown, X, Loader2, Clock, AlertTriangle, ExternalLink, Pencil } from 'lucide-react';
import AppHeader from './AppHeader';
import ConfirmModal from './ConfirmModal';

// Feature 2: Parse timeline string to a real due date relative to event date
function parseTimelineToDueDate(timeline, eventDate) {
  if (!timeline || !eventDate) return null;
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const t = timeline.toLowerCase().trim();

  // Match patterns like "6-8 months before", "2 weeks before", "12+ months before", "1 month before", "3-4 days before"
  const match = t.match(/(\d+)[\s+\-]*(?:(\d+)\s*)?(?:months?|weeks?|days?|years?)\s*before/);
  if (!match) return null;

  // Use the larger number (further from event) as the target
  const num = match[2] ? parseInt(match[2]) : parseInt(match[1]);
  const unit = t.match(/(months?|weeks?|days?|years?)/)?.[1] || '';

  const due = new Date(event);
  if (unit.startsWith('month')) {
    due.setMonth(due.getMonth() - num);
  } else if (unit.startsWith('week')) {
    due.setDate(due.getDate() - num * 7);
  } else if (unit.startsWith('day')) {
    due.setDate(due.getDate() - num);
  } else if (unit.startsWith('year')) {
    due.setFullYear(due.getFullYear() - num);
  }
  return due;
}

function formatDueDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Feature 4: Check if an item is overdue
function isOverdue(timeline, eventDate, done) {
  if (done) return false;
  const due = parseTimelineToDueDate(timeline, eventDate);
  if (!due) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due < now;
}

const DEFAULT_TEMPLATES = {
  wedding: {
    name: 'Wedding',
    items: [
      { text: 'Set date and budget', timeline: '12+ months before' },
      { text: 'Book venue', timeline: '12+ months before' },
      { text: 'Book photographer', timeline: '10-12 months before' },
      { text: 'Book caterer', timeline: '10-12 months before' },
      { text: 'Book DJ or live band', timeline: '8-10 months before' },
      { text: 'Book florist', timeline: '8-10 months before' },
      { text: 'Book videographer', timeline: '6-8 months before' },
      { text: 'Book decorator/stylist', timeline: '6-8 months before' },
      { text: 'Order wedding cake', timeline: '4-6 months before' },
      { text: 'Send invitations', timeline: '3-4 months before' },
      { text: 'Confirm all vendor bookings', timeline: '1 month before' },
      { text: 'Final venue walkthrough', timeline: '2 weeks before' },
      { text: 'Confirm guest count with caterer', timeline: '1 week before' },
    ],
  },
  birthday: {
    name: 'Birthday Party',
    items: [
      { text: 'Set date, budget, and guest list', timeline: '6-8 weeks before' },
      { text: 'Choose theme', timeline: '6-8 weeks before' },
      { text: 'Book venue (if not at home)', timeline: '4-6 weeks before' },
      { text: 'Book caterer or plan menu', timeline: '4-6 weeks before' },
      { text: 'Book entertainment (DJ, band, etc.)', timeline: '4-6 weeks before' },
      { text: 'Send invitations', timeline: '3-4 weeks before' },
      { text: 'Order cake', timeline: '2-3 weeks before' },
      { text: 'Buy decorations and supplies', timeline: '1-2 weeks before' },
      { text: 'Confirm all bookings', timeline: '1 week before' },
      { text: 'Prepare party bags or favours', timeline: '2-3 days before' },
    ],
  },
  corporate: {
    name: 'Corporate Event',
    items: [
      { text: 'Define objectives and budget', timeline: '3+ months before' },
      { text: 'Book venue', timeline: '2-3 months before' },
      { text: 'Book caterer', timeline: '2-3 months before' },
      { text: 'Arrange AV and tech requirements', timeline: '2 months before' },
      { text: 'Book photographer', timeline: '6-8 weeks before' },
      { text: 'Send invitations / internal comms', timeline: '4-6 weeks before' },
      { text: 'Finalise agenda and speakers', timeline: '2-4 weeks before' },
      { text: 'Confirm headcount', timeline: '1-2 weeks before' },
      { text: 'Brief all vendors', timeline: '1 week before' },
      { text: 'Venue setup and tech check', timeline: 'Day before' },
    ],
  },
  custom: {
    name: 'Custom',
    items: [],
  },
};

export default function EventChecklist() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('custom');
  const [expandedId, setExpandedId] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    fetchChecklists();
  }, []);

  // Auto-expand checklist from ?open= param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (openId) setExpandedId(openId);
  }, []);

  async function fetchChecklists() {
    try {
      const res = await fetch('/api/checklists');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChecklists(data.checklists || []);
    } catch {
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  }

  async function createChecklist() {
    if (!newName.trim()) return;
    const template = DEFAULT_TEMPLATES[newTemplate];
    try {
      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          items: template.items,
        }),
      });
      if (!res.ok) throw new Error();
      const { checklist } = await res.json();
      setChecklists((prev) => [checklist, ...prev]);
      setNewName('');
      setNewTemplate('custom');
      setShowNewForm(false);
      setExpandedId(checklist.id);
    } catch {}
  }

  async function deleteChecklist(id) {
    try {
      await fetch(`/api/checklists/${id}`, { method: 'DELETE' });
      setChecklists((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {}
  }

  async function toggleItem(checklistId, itemId, currentDone) {
    // Optimistic update
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? { ...c, items: c.items.map((item) => (item.id === itemId ? { ...item, done: !currentDone } : item)) }
          : c
      )
    );
    try {
      await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !currentDone }),
      });
    } catch {
      // Revert on failure
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === checklistId
            ? { ...c, items: c.items.map((item) => (item.id === itemId ? { ...item, done: currentDone } : item)) }
            : c
        )
      );
    }
  }

  async function addItem(checklistId) {
    if (!newItemText.trim()) return;
    const text = newItemText.trim();
    setNewItemText('');
    try {
      const res = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const { item } = await res.json();
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === checklistId ? { ...c, items: [...c.items, item] } : c
        )
      );
    } catch {}
  }

  async function removeItem(checklistId, itemId) {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId ? { ...c, items: c.items.filter((item) => item.id !== itemId) } : c
      )
    );
    try {
      await fetch(`/api/checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' });
    } catch {}
  }

  async function updateEventDate(checklistId, date) {
    setChecklists((prev) =>
      prev.map((c) => (c.id === checklistId ? { ...c, eventDate: date || null } : c))
    );
    try {
      await fetch(`/api/checklists/${checklistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: date || null }),
      });
    } catch {}
  }

  async function renameChecklist(id) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    const old = checklists.find((c) => c.id === id);
    if (!old || old.name === trimmed) { setRenamingId(null); return; }

    setChecklists((prev) => prev.map((c) => c.id === id ? { ...c, name: trimmed } : c));
    setRenamingId(null);
    try {
      await fetch(`/api/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
    } catch {
      setChecklists((prev) => prev.map((c) => c.id === id ? { ...c, name: old.name } : c));
    }
  }

  function getCountdown(dateStr) {
    if (!dateStr) return null;
    const eventDate = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diff = eventDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `${Math.abs(days)} days ago`, past: true };
    if (days === 0) return { text: 'Today!', past: false };
    if (days === 1) return { text: 'Tomorrow!', past: false };
    return { text: `${days} days to go`, past: false };
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Checklists</h1>
              <p className="text-gray-500 mt-1">Plan your events step by step</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus size={15} />
              New Checklist
            </button>
          </div>

          {/* New checklist form */}
          {showNewForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Create a checklist</h3>
                <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sarah's Wedding, Tom's 30th..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') createChecklist(); }}
              />
              <p className="text-sm text-gray-500 mb-2">Start from a template:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(DEFAULT_TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    onClick={() => setNewTemplate(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      newTemplate === key
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {tmpl.name}
                    {tmpl.items.length > 0 && <span className="text-xs ml-1 opacity-70">({tmpl.items.length})</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={createChecklist}
                disabled={!newName.trim()}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          )}

          {/* Checklists */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : checklists.length === 0 && !showNewForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No checklists yet</h2>
              <p className="text-gray-500 mb-6">
                Create a checklist to keep track of everything you need for your event.
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Create Your First Checklist
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {checklists.map((checklist) => {
                const isExpanded = expandedId === checklist.id;
                const doneCount = checklist.items.filter((i) => i.done).length;
                const totalCount = checklist.items.length;
                const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                return (
                  <div key={checklist.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Summary */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : checklist.id); } }}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <svg className="w-10 h-10 -rotate-90">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="20" cy="20" r="16" fill="none" stroke="#7c3aed" strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset="0"
                            pathLength="100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                          {pct}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {renamingId === checklist.id ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => renameChecklist(checklist.id)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') renameChecklist(checklist.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-gray-900 bg-white border border-purple-300 rounded px-2 py-0.5 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-gray-900 truncate">{checklist.name}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(checklist.id);
                                setRenameValue(checklist.name);
                              }}
                              className="p-0.5 text-gray-300 hover:text-purple-600 transition-colors flex-shrink-0"
                              title="Rename checklist"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">{doneCount}/{totalCount} completed</p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5">
                        {/* Event date + countdown */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <label className="text-sm text-gray-600">Event date:</label>
                            <input
                              type="date"
                              value={checklist.eventDate ? new Date(checklist.eventDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => updateEventDate(checklist.id, e.target.value)}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          {(() => {
                            const countdown = getCountdown(checklist.eventDate);
                            if (!countdown) return null;
                            return (
                              <div className={`flex items-center gap-1.5 text-sm font-medium ${countdown.past ? 'text-red-500' : 'text-purple-600'}`}>
                                <Clock size={14} />
                                {countdown.text}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Feature 4: Overdue count summary */}
                        {(() => {
                          const overdueCount = checklist.items.filter((item) => isOverdue(item.timeline, checklist.eventDate, item.done)).length;
                          if (overdueCount === 0) return null;
                          return (
                            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                              <p className="text-sm text-amber-800 font-medium">
                                {overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}
                              </p>
                            </div>
                          );
                        })()}

                        <div className="space-y-1 mb-4">
                          {checklist.items.map((item) => {
                            const overdue = isOverdue(item.timeline, checklist.eventDate, item.done);
                            const dueDate = parseTimelineToDueDate(item.timeline, checklist.eventDate);

                            return (
                              <div
                                key={item.id}
                                className={`flex items-start gap-3 py-2 px-2 rounded-lg group transition-colors ${
                                  overdue ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
                                }`}
                              >
                                <button onClick={() => toggleItem(checklist.id, item.id, item.done)} className="mt-0.5 flex-shrink-0">
                                  {item.done ? (
                                    <CheckCircle2 size={20} className="text-purple-600" />
                                  ) : (
                                    <Circle size={20} className={overdue ? 'text-amber-400' : 'text-gray-300'} />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                      {item.text}
                                    </p>
                                    {overdue && (
                                      <span className="text-xs font-medium px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                                        Overdue
                                      </span>
                                    )}
                                  </div>
                                  {item.timeline && (
                                    <p className={`text-xs mt-0.5 ${overdue ? 'text-amber-600' : 'text-gray-400'}`}>
                                      {item.timeline}
                                      {dueDate && (
                                        <span className="ml-1">(by {formatDueDate(dueDate)})</span>
                                      )}
                                    </p>
                                  )}
                                  {/* Feature 3: Browse vendors link */}
                                  {item.category && !item.done && (
                                    <Link
                                      href={`/marketplace?categories=${encodeURIComponent(item.category)}`}
                                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 mt-1 font-medium"
                                    >
                                      Browse {item.category} vendors
                                      <ExternalLink size={10} />
                                    </Link>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeItem(checklist.id, item.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add item */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <input
                            type="text"
                            value={expandedId === checklist.id ? newItemText : ''}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Add a task..."
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyDown={(e) => { if (e.key === 'Enter') addItem(checklist.id); }}
                          />
                          <button
                            onClick={() => addItem(checklist.id)}
                            disabled={!newItemText.trim()}
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => setConfirmAction({ id: checklist.id })}
                          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors mt-4"
                        >
                          <Trash2 size={14} />
                          Delete checklist
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          title="Delete this checklist?"
          message="All items in this checklist will be permanently deleted."
          confirmLabel="Delete"
          onConfirm={() => {
            deleteChecklist(confirmAction.id);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
