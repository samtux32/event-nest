'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Trash2,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Lightbulb,
  Loader2,
  Pencil,
  RotateCcw,
  CheckSquare,
  RefreshCw,
  X,
  Plus,
} from 'lucide-react';
import AppHeader from './AppHeader';
import ConfirmModal from './ConfirmModal';
import BudgetTracker from './BudgetTracker';

const PRIORITY_COLOURS = {
  essential:   { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  recommended: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  optional:    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const CATEGORY_COLOURS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#7c3aed', '#4f46e5', '#be185d',
];

export default function SavedPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [creatingChecklist, setCreatingChecklist] = useState(null); // plan id
  const [swapModal, setSwapModal] = useState(null); // { planId, category, currentVendorId?, mode: 'swap'|'add' }
  const [swapCandidates, setSwapCandidates] = useState([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [existingChecklists, setExistingChecklists] = useState({}); // { planTitle: checklistId }
  const [renamingPlanId, setRenamingPlanId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchPlans();
    fetchChecklists();
    fetch('/api/bookings?limit=100')
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {});
  }, []);

  // Auto-expand plan from ?open= param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (openId) setExpandedId(openId);
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch('/api/saved-plans');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChecklists() {
    try {
      const res = await fetch('/api/checklists');
      if (!res.ok) return;
      const data = await res.json();
      const map = {};
      (data.checklists || []).forEach((c) => { map[c.name] = c.id; });
      setExistingChecklists(map);
    } catch {}
  }

  async function deletePlan(id) {
    try {
      await fetch(`/api/saved-plans/${id}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (expandedId === id) setExpandedId(null);
      if (editingId === id) setEditingId(null);
    } catch {}
  }

  function startEdit(saved) {
    setEditingId(saved.id);
    setEditPrompt(saved.prompt);
    setEditBudget(saved.totalBudget?.toString() || '');
  }

  async function regeneratePlan(id) {
    setRegenerating(true);
    try {
      // Build prompt with optional budget override
      let fullPrompt = editPrompt.trim();
      if (editBudget) {
        // Replace existing budget mention or append
        fullPrompt = fullPrompt.replace(/£[\d,]+\s*budget/i, '').replace(/,\s*$/, '').trim();
        fullPrompt += `, £${editBudget} budget`;
      }

      // Generate new plan
      const genRes = await fetch('/api/event-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!genRes.ok) throw new Error('Failed to generate plan');
      const genData = await genRes.json();

      // Update saved plan — keep existing title (user may have renamed it)
      const existing = plans.find((p) => p.id === id);
      const updateRes = await fetch(`/api/saved-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          title: existing?.title || genData.plan.title,
          theme: genData.plan.theme,
          totalBudget: genData.plan.totalBudget,
          categories: genData.plan.categories,
          tips: genData.plan.tips,
          vendors: genData.vendors,
          checklist: genData.plan.checklist || null,
        }),
      });
      if (!updateRes.ok) throw new Error('Failed to update plan');
      const { plan: updated } = await updateRes.json();

      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch {
      // Could show error but keeping simple
    } finally {
      setRegenerating(false);
    }
  }

  async function createChecklistFromPlan(saved) {
    setCreatingChecklist(saved.id);
    try {
      const categories = saved.categories || [];

      // Vendor booking items from plan categories (with category link for Feature 3)
      const vendorItems = categories.map((cat) => ({
        text: `Book ${cat.category.toLowerCase()} (budget: £${cat.budgetAllocation?.toLocaleString()})`,
        timeline: cat.priority === 'essential' ? '2-3 months before' : '1-2 months before',
        category: cat.category,
      }));

      // AI-generated checklist items (from plan) or minimal fallback for old plans
      const aiItems = saved.checklist?.length
        ? saved.checklist.map((item) => ({ text: item.text, timeline: item.timeline || null }))
        : [
            { text: 'Set date and budget', timeline: '3-4 months before' },
            { text: 'Create guest list', timeline: '2-3 months before' },
            { text: 'Send invitations', timeline: '4-6 weeks before' },
            { text: 'Confirm all bookings', timeline: '1 week before' },
            { text: 'Final headcount confirmation', timeline: '3-4 days before' },
          ];

      const items = [...aiItems, ...vendorItems];

      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saved.title, items, eventDate: saved.eventDate || null }),
      });
      if (!res.ok) throw new Error();
      const { checklist } = await res.json();
      if (checklist) {
        setExistingChecklists((prev) => ({ ...prev, [saved.title]: checklist.id }));
      }
      window.location.href = '/event-checklist';
    } catch {} finally {
      setCreatingChecklist(null);
    }
  }

  async function renamePlan(id) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingPlanId(null); return; }
    const plan = plans.find((p) => p.id === id);
    if (!plan || plan.title === trimmed) { setRenamingPlanId(null); return; }

    // Update checklist map if name changed
    const oldTitle = plan.title;

    // Optimistic update
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, title: trimmed } : p));
    setRenamingPlanId(null);

    try {
      const res = await fetch(`/api/saved-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error();
      // Update checklist name mapping
      if (existingChecklists[oldTitle]) {
        setExistingChecklists((prev) => {
          const next = { ...prev };
          next[trimmed] = next[oldTitle];
          delete next[oldTitle];
          return next;
        });
      }
    } catch {
      setPlans((prev) => prev.map((p) => p.id === id ? { ...p, title: oldTitle } : p));
    }
  }

  function mapApiVendor(v, category) {
    return {
      id: v.id,
      businessName: v.name || v.businessName,
      category: v.category || category,
      profileImageUrl: v.image || v.profileImageUrl || null,
      coverImageUrl: null,
      location: v.location,
      averageRating: v.rating != null ? Number(v.rating) : null,
      totalReviews: v.reviews || 0,
      startingPrice: null,
      tagline: v.description || null,
    };
  }

  async function openVendorModal(planId, category, currentVendorId, mode = 'add') {
    const plan = plans.find((p) => p.id === planId);
    const existingIds = (plan?.vendors?.[category] || []).map((v) => v.id);
    setSwapModal({ planId, category, currentVendorId, mode });
    setSwapLoading(true);
    setSwapCandidates([]);
    try {
      const res = await fetch(`/api/vendors?categories=${encodeURIComponent(category)}&limit=15`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const candidates = (data.vendors || []).filter((v) => !existingIds.includes(v.id));
      setSwapCandidates(candidates);
    } catch {
      setSwapCandidates([]);
    } finally {
      setSwapLoading(false);
    }
  }

  async function selectVendorFromModal(newVendor) {
    if (!swapModal) return;
    const { planId, category, currentVendorId, mode } = swapModal;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedVendors = { ...plan.vendors };
    const categoryVendors = [...(updatedVendors[category] || [])];
    const mapped = mapApiVendor(newVendor, category);

    if (mode === 'swap' && currentVendorId) {
      updatedVendors[category] = categoryVendors.map((v) => v.id === currentVendorId ? mapped : v);
    } else {
      categoryVendors.push(mapped);
      updatedVendors[category] = categoryVendors;
    }

    try {
      const res = await fetch(`/api/saved-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors: updatedVendors }),
      });
      if (!res.ok) throw new Error();
      const { plan: updated } = await res.json();
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    } catch {}
    setSwapModal(null);
  }

  async function removeVendorFromPlan(planId, category, vendorId) {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedVendors = { ...plan.vendors };
    updatedVendors[category] = (updatedVendors[category] || []).filter((v) => v.id !== vendorId);

    try {
      const res = await fetch(`/api/saved-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors: updatedVendors }),
      });
      if (!res.ok) throw new Error();
      const { plan: updated } = await res.json();
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    } catch {}
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Saved Plans</h1>
              <p className="text-gray-500 mt-1">{plans.length} plan{plans.length !== 1 ? 's' : ''} saved</p>
            </div>
            <Link
              href="/plan-my-event"
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Sparkles size={15} />
              New Plan
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No saved plans yet</h2>
              <p className="text-gray-500 mb-6">
                Generate a plan with the AI Event Planner and save it to view here later.
              </p>
              <Link
                href="/plan-my-event"
                className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Create a Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((saved) => {
                const categories = saved.categories || [];
                const vendors = saved.vendors || {};
                const isExpanded = expandedId === saved.id;
                const isEditing = editingId === saved.id;

                return (
                  <div key={saved.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Summary row */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(isExpanded ? null : saved.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : saved.id); } }}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renamingPlanId === saved.id ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => renamePlan(saved.id)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') renamePlan(saved.id);
                              if (e.key === 'Escape') setRenamingPlanId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-gray-900 bg-white border border-purple-300 rounded px-2 py-0.5 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-gray-900 truncate">{saved.title}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingPlanId(saved.id);
                                setRenameValue(saved.title);
                              }}
                              className="p-0.5 text-gray-300 hover:text-purple-600 transition-colors flex-shrink-0"
                              title="Rename plan"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 truncate">
                          {saved.theme} &middot; £{saved.totalBudget?.toLocaleString()} &middot; {categories.length || 0} categories
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{timeAgo(saved.createdAt)}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5">
                        {/* Edit form */}
                        {isEditing ? (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-5">
                            <p className="text-sm font-medium text-purple-900 mb-3">Edit & Re-generate</p>
                            <textarea
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              rows={3}
                              className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-3"
                            />
                            <div className="flex items-center gap-3 mb-3">
                              <label className="text-sm text-purple-800">Budget override:</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                                <input
                                  type="number"
                                  value={editBudget}
                                  onChange={(e) => setEditBudget(e.target.value)}
                                  placeholder="Optional"
                                  className="pl-7 pr-3 py-1.5 border border-purple-300 rounded-lg text-sm w-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => regeneratePlan(saved.id)}
                                disabled={regenerating || !editPrompt.trim()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                              >
                                {regenerating ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Regenerating...
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw size={14} />
                                    Re-generate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                disabled={regenerating}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Original prompt */
                          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                            <p className="text-xs text-gray-400 mb-1">Your request</p>
                            <p className="text-sm text-gray-700">{saved.prompt}</p>
                          </div>
                        )}

                        {/* Budget bar */}
                        <div className="mb-5">
                          <p className="text-sm font-medium text-gray-500 mb-2">Budget: £{saved.totalBudget?.toLocaleString()}</p>
                          <div className="flex rounded-full overflow-hidden h-4 mb-2">
                            {categories.map((cat, i) => {
                              const pct = saved.totalBudget ? (cat.budgetAllocation / saved.totalBudget) * 100 : 0;
                              if (pct < 1) return null;
                              return (
                                <div
                                  key={cat.category}
                                  className="h-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: CATEGORY_COLOURS[i % CATEGORY_COLOURS.length],
                                    minWidth: '4px',
                                  }}
                                  title={`${cat.category}: £${cat.budgetAllocation}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {categories.map((cat, i) => {
                              const pColours = PRIORITY_COLOURS[cat.priority] || PRIORITY_COLOURS.recommended;
                              const matchedVendors = vendors[cat.category] || [];
                              return (
                                <div key={cat.category} className="text-sm text-gray-600 flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLOURS[i % CATEGORY_COLOURS.length] }} />
                                  {cat.category}: £{cat.budgetAllocation?.toLocaleString()}
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${pColours.bg} ${pColours.text}`}>{cat.priority}</span>
                                  {matchedVendors.length > 0 && (
                                    <span className="text-xs text-gray-400">({matchedVendors.length} vendors)</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Budget Tracker — spending vs plan */}
                        {saved.totalBudget && (
                          <div className="mb-5">
                            <BudgetTracker plan={saved} bookings={bookings.filter(b => b.savedPlanId === saved.id || b.savedPlan?.id === saved.id)} />
                          </div>
                        )}

                        {/* Vendor matches by category */}
                        {(Object.entries(vendors).some(([, v]) => v.length > 0) || categories.length > 0) && (
                          <div className="mb-5">
                            <p className="text-sm font-medium text-gray-500 mb-3">Matched Vendors</p>
                            <div className="space-y-3">
                              {/* Show all plan categories, even ones with no vendors yet */}
                              {(() => {
                                const catNames = new Set([
                                  ...categories.map((c) => c.category),
                                  ...Object.keys(vendors),
                                ]);
                                return [...catNames].map((catName) => {
                                  const catVendors = vendors[catName] || [];
                                return (
                                  <div key={catName}>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{catName}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {catVendors.map((v) => (
                                        <div key={v.id} className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg group">
                                          <Link href={`/vendor-profile/${v.id}`} className="flex items-center gap-2.5 min-w-0 flex-1">
                                            {v.profileImageUrl ? (
                                              <img src={v.profileImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                                            ) : (
                                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs flex-shrink-0">
                                                {v.businessName?.[0]}
                                              </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">{v.businessName}</p>
                                              {v.averageRating > 0 && (
                                                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                                  {Number(v.averageRating).toFixed(1)}
                                                </span>
                                              )}
                                            </div>
                                          </Link>
                                          <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button
                                              onClick={() => openVendorModal(saved.id, catName, v.id, 'swap')}
                                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                              title="Swap vendor"
                                            >
                                              <RefreshCw size={13} />
                                            </button>
                                            <button
                                              onClick={() => removeVendorFromPlan(saved.id, catName, v.id)}
                                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                              title="Remove vendor"
                                            >
                                              <X size={13} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => openVendorModal(saved.id, catName, null, 'add')}
                                        className="flex items-center justify-center gap-1.5 p-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                      >
                                        <Plus size={14} />
                                        Add vendor
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {saved.tips?.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Lightbulb size={14} className="text-amber-600" />
                              <p className="text-sm font-medium text-amber-900">Tips</p>
                            </div>
                            <ul className="space-y-1">
                              {saved.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-amber-800 flex items-start gap-1.5">
                                  <span className="text-amber-500">•</span> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-4 flex-wrap">
                          {!isEditing && (
                            <button
                              onClick={() => startEdit(saved)}
                              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                            >
                              <Pencil size={14} />
                              Edit Plan
                            </button>
                          )}
                          {existingChecklists[saved.title] ? (
                            <Link
                              href="/event-checklist"
                              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                            >
                              <CheckSquare size={14} />
                              View Checklist
                            </Link>
                          ) : (
                            <button
                              onClick={() => createChecklistFromPlan(saved)}
                              disabled={creatingChecklist === saved.id}
                              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50"
                            >
                              {creatingChecklist === saved.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckSquare size={14} />
                              )}
                              Create Checklist
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmAction({ type: 'deletePlan', id: saved.id })}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete this plan
                          </button>
                        </div>
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
          title="Delete this plan?"
          message="This plan will be permanently deleted."
          confirmLabel="Delete"
          onConfirm={() => {
            deletePlan(confirmAction.id);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Vendor picker modal (swap or add) */}
      {swapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSwapModal(null)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {swapModal.mode === 'swap' ? 'Swap Vendor' : 'Add Vendor'}
                </h3>
                <p className="text-xs text-gray-500">{swapModal.category}</p>
              </div>
              <button onClick={() => setSwapModal(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[55vh] p-4">
              {swapLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              ) : swapCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No other vendors found in this category</p>
              ) : (
                <div className="space-y-2">
                  {swapCandidates.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVendorFromModal(v)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                    >
                      {v.image ? (
                        <img src={v.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm flex-shrink-0">
                          {v.name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {v.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <Star size={10} className="text-yellow-500 fill-yellow-500" />
                              {Number(v.rating).toFixed(1)}
                            </span>
                          )}
                          {v.location && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <MapPin size={10} />
                              {v.location}
                            </span>
                          )}
                        </div>
                        {v.startingPrice && (
                          <p className="text-xs text-purple-600 font-medium mt-0.5">{v.startingPrice}</p>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
