'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import QuoteAcceptModal from '@/components/QuoteAcceptModal';

function formatPrice(num) {
  return `£${Number(num).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const statusStyles = {
  pending:  'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-700',
};

const statusLabels = {
  pending:  'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
};

export default function QuoteCard({ quote, isCustomer, onQuoteUpdated }) {
  const [showModal, setShowModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(quote.status);

  const handleAccepted = (bookingId) => {
    setLocalStatus('accepted');
    if (onQuoteUpdated) onQuoteUpdated({ ...quote, status: 'accepted', bookingId });
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this quote?')) return;
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });
      if (res.ok) {
        setLocalStatus('declined');
        if (onQuoteUpdated) onQuoteUpdated({ ...quote, status: 'declined' });
      }
    } catch (err) {
      console.error('Decline quote error:', err);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">Custom Quote</p>
            <h3 className="text-white font-bold text-base leading-tight">{quote.title}</h3>
          </div>
          <p className="text-2xl font-extrabold text-white whitespace-nowrap">{formatPrice(quote.price)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {quote.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{quote.description}</p>
        )}

        {quote.features?.length > 0 && (
          <ul className="space-y-1.5">
            {quote.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={14} className="text-purple-600 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Status badge */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[localStatus]}`}>
            {statusLabels[localStatus]}
          </span>
        </div>

        {/* Actions — only shown to customer when pending */}
        {isCustomer && localStatus === 'pending' && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <QuoteAcceptModal
          quote={quote}
          onClose={() => setShowModal(false)}
          onAccepted={handleAccepted}
        />
      )}
    </div>
  );
}
