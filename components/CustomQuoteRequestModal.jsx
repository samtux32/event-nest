'use client';

import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomQuoteRequestModal({ vendor, onClose }) {
  const router = useRouter();
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [packageId, setPackageId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // 1. Create pending booking — this also upserts the conversation
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          eventDate: eventDate || undefined,
          eventType: eventType || undefined,
          startTime: eventTime || undefined,
          guestCount: guestCount ? parseInt(guestCount) : undefined,
          packageId: packageId || undefined,
          specialRequests: notes || undefined,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || 'Failed to send request');

      const convId = bookingData.conversationId;

      // 2. Send formatted message with all the details
      const selectedPkg = vendor.packages?.find(p => p.id === packageId);
      const lines = ['📋 Custom Quote Request'];
      if (eventType) lines.push(`Event type: ${eventType}`);
      if (eventDate) {
        const [y, m, d] = eventDate.split('-').map(Number);
        lines.push(`Date: ${new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
      }
      if (eventTime) lines.push(`Time: ${eventTime}`);
      if (guestCount) lines.push(`Guests: ${guestCount}`);
      if (selectedPkg) lines.push(`Package interest: ${selectedPkg.name} (£${Number(selectedPkg.price).toLocaleString('en-GB')})`);
      else lines.push('Package: Open to suggestions');
      if (notes) lines.push(`\nSpecial requirements:\n${notes}`);

      await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lines.join('\n') }),
      });

      // 3. Redirect to messages
      router.push(`/customer-messages?conv=${convId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request Custom Quote</h2>
            <p className="text-xs text-gray-500 mt-0.5">from {vendor.businessName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Type</label>
            <input
              type="text"
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              placeholder="e.g. Wedding, Birthday, Corporate event"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date</label>
              <input
                type="date"
                value={eventDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time</label>
              <input
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Guests</label>
            <input
              type="number"
              value={guestCount}
              onChange={e => setGuestCount(e.target.value)}
              placeholder="Approximate number"
              min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {vendor.packages?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Package Interest</label>
              <select
                value={packageId}
                onChange={e => setPackageId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              >
                <option value="">Open to suggestions</option>
                {vendor.packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — £{Number(pkg.price).toLocaleString('en-GB')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requirements</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements, themes, or preferences..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
