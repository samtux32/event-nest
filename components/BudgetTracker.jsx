'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PoundSterling, AlertTriangle } from 'lucide-react';

const OVERSPEND_TIPS = {
  venue: 'Consider off-peak dates or less central locations',
  photography: 'Ask about shorter coverage or skip the pre-event shoot',
  videography: 'Consider highlights-only instead of full coverage',
  catering: 'Switch to buffet style or trim the drink package',
  cake: 'A smaller display cake with sheet cake for serving',
  florist: 'Use seasonal flowers or mix real with high-quality faux',
  flowers: 'Use seasonal flowers or mix real with high-quality faux',
  entertainment: 'Book for key moments only (e.g. first dance + 2 hours)',
  music: 'Consider a DJ instead of a live band, or shorter set',
  decoration: 'DIY some elements or reuse ceremony décor at reception',
  decorations: 'DIY some elements or reuse ceremony décor at reception',
  stationery: 'Go digital for save-the-dates, print only invitations',
  transport: 'Hire for one journey only or use a single vehicle',
};

function getOverspendTip(category) {
  const key = category.toLowerCase().trim();
  for (const [k, v] of Object.entries(OVERSPEND_TIPS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return 'Review your requirements — small adjustments can add up';
}

function computeBudget(plan, bookings) {
  const activeBookings = bookings.filter(
    b => b.status !== 'cancelled' && (b.totalPrice || b.package?.price)
  );

  const categories = {};
  const planCategories = Array.isArray(plan.categories) ? plan.categories : [];

  for (const cat of planCategories) {
    if (cat.category && cat.budgetAllocation) {
      categories[cat.category.toLowerCase()] = {
        name: cat.category,
        allocated: Number(cat.budgetAllocation),
        spent: 0,
        vendors: [],
      };
    }
  }

  let unmatchedSpent = 0;
  const unmatchedVendors = [];

  for (const b of activeBookings) {
    const price = Number(b.totalPrice || b.package?.price || 0);
    if (!price) continue;

    const vendorCat = (b.vendor?.categories?.[0] || '').toLowerCase();
    const vendorName = b.vendor?.businessName || 'Vendor';

    let matched = false;
    for (const key of Object.keys(categories)) {
      if (vendorCat && (key.includes(vendorCat) || vendorCat.includes(key))) {
        categories[key].spent += price;
        categories[key].vendors.push(vendorName);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatchedSpent += price;
      unmatchedVendors.push(vendorName);
    }
  }

  const totalBudget = Number(plan.totalBudget) || 0;
  const totalSpent = Object.values(categories).reduce((s, c) => s + c.spent, 0) + unmatchedSpent;

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    categories: Object.values(categories).filter(c => c.allocated > 0),
    unmatchedSpent,
    unmatchedVendors,
  };
}

function ProgressBar({ pct, className = '' }) {
  const color = pct > 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function BudgetTracker({ plan, bookings }) {
  const [expanded, setExpanded] = useState(false);
  const budget = computeBudget(plan, bookings);

  if (!budget.totalBudget) return null;

  const overallPct = Math.round((budget.totalSpent / budget.totalBudget) * 100);
  const isOver = budget.remaining < 0;

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <PoundSterling size={16} className="text-purple-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">Budget Tracker</span>
            <span className="text-sm text-gray-600">
              £{budget.totalSpent.toLocaleString('en-GB')} / £{budget.totalBudget.toLocaleString('en-GB')}
            </span>
          </div>
          <ProgressBar pct={overallPct} className="mt-1.5" />
          <p className={`text-xs mt-1 ${isOver ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {isOver
              ? `£${Math.abs(budget.remaining).toLocaleString('en-GB')} over budget!`
              : `£${budget.remaining.toLocaleString('en-GB')} remaining`}
          </p>
        </div>
        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {budget.categories.map(cat => {
            const pct = Math.round((cat.spent / cat.allocated) * 100);
            const over = cat.spent > cat.allocated;
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{cat.name}</span>
                  <span className={`${over ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    £{cat.spent.toLocaleString('en-GB')} / £{cat.allocated.toLocaleString('en-GB')}
                  </span>
                </div>
                <ProgressBar pct={pct} className="mt-1" />
                {cat.vendors.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{cat.vendors.join(', ')}</p>
                )}
                {over && (
                  <div className="flex items-start gap-1.5 mt-1.5 px-2 py-1.5 bg-amber-50 rounded text-xs text-amber-700">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{getOverspendTip(cat.name)}</span>
                  </div>
                )}
              </div>
            );
          })}

          {budget.unmatchedSpent > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                + £{budget.unmatchedSpent.toLocaleString('en-GB')} from {budget.unmatchedVendors.join(', ')} (not matched to a plan category)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
