'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  Star,
  MapPin,
  Heart,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import CustomerHeader from './CustomerHeader';

const EXAMPLE_PROMPTS = [
  'Birthday party for my 7 year old son who loves football, £200 budget',
  'Elegant wedding reception for 80 guests, £5000 budget',
  'Corporate team building event for 30 people',
  'Baby shower for 20 guests, floral theme, £500 budget',
  'Surprise 50th anniversary dinner, £1500 budget',
  '18th birthday house party with DJ and catering, £800',
];

const PRIORITY_COLOURS = {
  essential:   { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  recommended: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  optional:    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const CATEGORY_COLOURS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#0891b2', '#7c3aed', '#4f46e5', '#be185d',
];

export default function AIEventPlanner() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistSaved, setWishlistSaved] = useState(false);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setWishlistSaved(false);

    try {
      const res = await fetch('/api/event-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveAllToWishlist() {
    if (!result || wishlistSaved) return;
    setSavingWishlist(true);
    try {
      // Create a wishlist group
      const groupRes = await fetch('/api/wishlist/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: result.plan.title || 'AI Event Plan' }),
      });
      const groupData = await groupRes.json();
      if (!groupRes.ok) throw new Error('Failed to create wishlist group');

      // Add all vendors to the group + general wishlist
      const allVendors = Object.values(result.vendors).flat();
      await Promise.all(
        allVendors.map(async (v) => {
          // Add to general wishlist
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendorId: v.id }),
          });
          // Add to group
          await fetch(`/api/wishlist/groups/${groupData.group?.id || groupData.id}/vendors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendorId: v.id }),
          });
        })
      );
      setWishlistSaved(true);
    } catch {
      setError('Failed to save to wishlist. Please try again.');
    } finally {
      setSavingWishlist(false);
    }
  }

  function startOver() {
    setResult(null);
    setPrompt('');
    setError('');
    setWishlistSaved(false);
  }

  const plan = result?.plan;
  const vendors = result?.vendors || {};

  return (
    <>
      <CustomerHeader />
      <div className="min-h-screen bg-gray-50">
        {!result ? (
          /* ─── Input screen ─── */
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Event Planner</h1>
              <p className="text-gray-500 text-lg">
                Describe your dream event and we&apos;ll create a personalised plan with budget breakdown and real vendor matches.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your event
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Birthday party for my 7 year old son who loves football, £200 budget"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }
                }}
              />

              <button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate My Plan
                  </>
                )}
              </button>
            </div>

            {/* Example prompts */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* ─── Results screen ─── */
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
                <p className="text-gray-500 mt-1">Theme: {plan.theme}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg text-lg">
                  £{plan.totalBudget?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Budget bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-sm font-medium text-gray-500 mb-3">Budget Breakdown</h2>
              <div className="flex rounded-full overflow-hidden h-6 mb-4">
                {(plan.categories || []).map((cat, i) => {
                  const pct = plan.totalBudget ? (cat.budgetAllocation / plan.totalBudget) * 100 : 0;
                  if (pct < 1) return null;
                  return (
                    <div
                      key={cat.category}
                      className="h-full flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLOURS[i % CATEGORY_COLOURS.length],
                        minWidth: pct > 8 ? undefined : '24px',
                      }}
                      title={`${cat.category}: £${cat.budgetAllocation}`}
                    >
                      {pct > 12 ? `${Math.round(pct)}%` : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {(plan.categories || []).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLOURS[i % CATEGORY_COLOURS.length] }}
                    />
                    {cat.category}: £{cat.budgetAllocation?.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>

            {/* Category cards */}
            <div className="space-y-6 mb-8">
              {(plan.categories || []).map((cat, i) => {
                const pColours = PRIORITY_COLOURS[cat.priority] || PRIORITY_COLOURS.recommended;
                const matchedVendors = vendors[cat.category] || [];

                return (
                  <div key={cat.category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: CATEGORY_COLOURS[i % CATEGORY_COLOURS.length] }}
                          >
                            {cat.category[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cat.category}</h3>
                            <p className="text-sm text-gray-500">Budget: £{cat.budgetAllocation?.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${pColours.bg} ${pColours.text} ${pColours.border}`}>
                          {cat.priority}
                        </span>
                      </div>

                      {cat.notes && (
                        <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg px-3 py-2">
                          {cat.notes}
                        </p>
                      )}

                      {/* Matched vendors */}
                      {matchedVendors.length > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                            {matchedVendors.length} vendor{matchedVendors.length !== 1 ? 's' : ''} found
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {matchedVendors.map((v) => (
                              <Link
                                key={v.id}
                                href={`/vendor-profile/${v.id}`}
                                className="group border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  {v.profileImageUrl ? (
                                    <img
                                      src={v.profileImageUrl}
                                      alt={v.businessName}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold flex-shrink-0">
                                      {v.businessName?.[0]}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                      {v.businessName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {v.averageRating > 0 && (
                                        <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                          {v.averageRating.toFixed(1)}
                                        </span>
                                      )}
                                      {v.location && (
                                        <span className="flex items-center gap-0.5 text-xs text-gray-400 truncate">
                                          <MapPin size={11} />
                                          {v.location}
                                        </span>
                                      )}
                                    </div>
                                    {v.startingPrice && (
                                      <p className="text-xs text-purple-600 font-medium mt-0.5">
                                        From £{v.startingPrice.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No vendors in this category yet</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            {plan.tips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-amber-600" />
                  <h2 className="font-semibold text-amber-900">Planning Tips</h2>
                </div>
                <ul className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {Object.values(vendors).flat().length > 0 && (
                <button
                  onClick={saveAllToWishlist}
                  disabled={savingWishlist || wishlistSaved}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm w-full sm:w-auto justify-center transition-colors ${
                    wishlistSaved
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                  }`}
                >
                  {wishlistSaved ? (
                    <>
                      <CheckCircle2 size={16} />
                      Saved to Wishlist
                    </>
                  ) : savingWishlist ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart size={16} />
                      Save All to Wishlist
                    </>
                  )}
                </button>
              )}
              <button
                onClick={startOver}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
              >
                <RotateCcw size={16} />
                Start Over
              </button>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
