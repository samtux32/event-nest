'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, ChevronDown, X, Loader2 } from 'lucide-react';
import AppHeader from './AppHeader';
import ConfirmModal from './ConfirmModal';

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

  useEffect(() => {
    fetchChecklists();
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
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
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
                        <h3 className="font-semibold text-gray-900 truncate">{checklist.name}</h3>
                        <p className="text-sm text-gray-500">{doneCount}/{totalCount} completed</p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5">
                        <div className="space-y-1 mb-4">
                          {checklist.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 group transition-colors"
                            >
                              <button onClick={() => toggleItem(checklist.id, item.id, item.done)} className="mt-0.5 flex-shrink-0">
                                {item.done ? (
                                  <CheckCircle2 size={20} className="text-purple-600" />
                                ) : (
                                  <Circle size={20} className="text-gray-300" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                  {item.text}
                                </p>
                                {item.timeline && (
                                  <p className="text-xs text-gray-400 mt-0.5">{item.timeline}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(checklist.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
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
