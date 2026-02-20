'use client';

import React, { useState } from 'react';
import { CalendarDays, Check, X, Clock } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  // Parse as local date to avoid timezone shifts
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function DateProposalCard({ message, isCustomer, onDateAccepted }) {
  const [loading, setLoading] = useState(false);
  const [localAction, setLocalAction] = useState(null); // 'accept' | 'decline'

  const { bookingId, proposedDate, bookingEventDate } = message;

  // Determine display state:
  // - proposedDate set → pending (or just acted locally)
  // - proposedDate null + eventDate set → accepted
  // - proposedDate null + no eventDate → declined
  const isPending = !!proposedDate && !localAction;
  const isAccepted = localAction === 'accept' || (!proposedDate && !!bookingEventDate);
  const isDeclined = localAction === 'decline' || (!proposedDate && !bookingEventDate && !isPending);

  // The date to display: use proposedDate if pending, bookingEventDate if accepted
  const displayDate = proposedDate || bookingEventDate;

  const handleResponse = async (action) => {
    if (!bookingId || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/propose-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setLocalAction(action);
        if (action === 'accept' && onDateAccepted) {
          onDateAccepted(proposedDate);
        }
      }
    } catch (err) {
      console.error('Failed to respond to date proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-white flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-100 uppercase tracking-wide mb-0.5">Date Proposal</p>
            <p className="text-white font-bold text-base leading-tight">{formatDate(displayDate)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Status badge */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              Awaiting response
            </span>
          </div>
        )}
        {isAccepted && (
          <div className="flex items-center gap-2">
            <Check size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              Date confirmed
            </span>
          </div>
        )}
        {isDeclined && !isPending && !isAccepted && (
          <div className="flex items-center gap-2">
            <X size={14} className="text-red-500" />
            <span className="text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
              Date declined
            </span>
          </div>
        )}

        {/* Action buttons — customer only, when pending */}
        {isCustomer && isPending && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleResponse('accept')}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? '...' : 'Accept'}
            </button>
            <button
              onClick={() => handleResponse('decline')}
              disabled={loading}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {loading ? '...' : 'Decline'}
            </button>
          </div>
        )}

        {isCustomer && isAccepted && (
          <p className="text-xs text-gray-500">
            This date is now saved to your booking. The vendor has been notified.
          </p>
        )}

        {isCustomer && isDeclined && !isPending && !isAccepted && (
          <p className="text-xs text-gray-500">
            The vendor can propose a new date for your event.
          </p>
        )}

        {!isCustomer && isPending && (
          <p className="text-xs text-gray-500">
            Waiting for the customer to accept or decline.
          </p>
        )}
      </div>
    </div>
  );
}
