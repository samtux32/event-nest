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
} from 'lucide-react';
import AppHeader from './AppHeader';
import ConfirmModal from './ConfirmModal';

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
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('savedEventPlans') || '[]');
      setPlans(stored);
    } catch {
      setPlans([]);
    }
  }, []);

  function deletePlan(id) {
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    localStorage.setItem('savedEventPlans', JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  }

  function clearAll() {
    setPlans([]);
    localStorage.removeItem('savedEventPlans');
    setExpandedId(null);
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
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
            <div className="flex items-center gap-3">
              {plans.length > 0 && (
                <button onClick={() => setConfirmAction({ type: 'clearAll' })} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                  Clear all
                </button>
              )}
              <Link
                href="/plan-my-event"
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Sparkles size={15} />
                New Plan
              </Link>
            </div>
          </div>

          {plans.length === 0 ? (
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
                const plan = saved.plan;
                const vendors = saved.vendors || {};
                const isExpanded = expandedId === saved.id;

                return (
                  <div key={saved.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : saved.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{plan.title}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {plan.theme} &middot; £{plan.totalBudget?.toLocaleString()} &middot; {plan.categories?.length || 0} categories
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{timeAgo(saved.savedAt)}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5">
                        {/* Original prompt */}
                        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                          <p className="text-xs text-gray-400 mb-1">Your request</p>
                          <p className="text-sm text-gray-700">{saved.prompt}</p>
                        </div>

                        {/* Budget bar */}
                        <div className="mb-5">
                          <p className="text-sm font-medium text-gray-500 mb-2">Budget: £{plan.totalBudget?.toLocaleString()}</p>
                          <div className="flex rounded-full overflow-hidden h-4 mb-2">
                            {(plan.categories || []).map((cat, i) => {
                              const pct = plan.totalBudget ? (cat.budgetAllocation / plan.totalBudget) * 100 : 0;
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
                            {(plan.categories || []).map((cat, i) => {
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

                        {/* Vendor matches */}
                        {Object.entries(vendors).some(([, v]) => v.length > 0) && (
                          <div className="mb-5">
                            <p className="text-sm font-medium text-gray-500 mb-3">Matched Vendors</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.values(vendors).flat().map((v) => (
                                <Link
                                  key={v.id}
                                  href={`/vendor-profile/${v.id}`}
                                  className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors group"
                                >
                                  {v.profileImageUrl ? (
                                    <img src={v.profileImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                                      {v.businessName?.[0]}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">{v.businessName}</p>
                                    <p className="text-xs text-gray-500">{v.category}</p>
                                  </div>
                                  <ArrowRight size={12} className="text-gray-300 group-hover:text-purple-500 flex-shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {plan.tips?.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Lightbulb size={14} className="text-amber-600" />
                              <p className="text-sm font-medium text-amber-900">Tips</p>
                            </div>
                            <ul className="space-y-1">
                              {plan.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-amber-800 flex items-start gap-1.5">
                                  <span className="text-amber-500">•</span> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={() => setConfirmAction({ type: 'deletePlan', id: saved.id })}
                          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete this plan
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
          title={confirmAction.type === 'clearAll' ? 'Clear all plans?' : 'Delete this plan?'}
          message={confirmAction.type === 'clearAll' ? 'This will remove all your saved plans. This cannot be undone.' : 'This plan will be permanently deleted.'}
          confirmLabel="Delete"
          onConfirm={() => {
            if (confirmAction.type === 'clearAll') clearAll();
            else deletePlan(confirmAction.id);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}
