'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Package,
  Loader2,
  Star,
  X,
  ImagePlus,
  Trash2
} from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';

function formatPrice(val) {
  const num = Number(val);
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig = {
  new_inquiry: { label: 'Inquiry Sent', bg: 'bg-purple-100', text: 'text-purple-700' },
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700' },
  completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-600' },
};

function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = React.useRef(null);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...toAdd]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating'); return; }
    if (!text.trim()) { setError('Please write a review'); return; }
    setSubmitting(true);
    try {
      // Upload photos first
      const uploadedUrls = await Promise.all(
        photos.map(async ({ file }) => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/reviews/upload', { method: 'POST', body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error('Photo upload failed');
          return data.url;
        })
      );

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, rating, text, photos: uploadedUrls }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit review'); return; }
      onSubmitted(booking.id);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
            <p className="text-gray-500 mt-1">{booking.vendor?.businessName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              placeholder="Share your experience with this vendor..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos <span className="text-gray-400 font-normal">(optional, up to 3)</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={photo.preview} alt="" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (res.ok) setBookings(data.bookings);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds(prev => new Set([...prev, bookingId]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      <CustomerHeader />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">Track your vendor inquiries and confirmed bookings</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto mb-4 text-purple-600 animate-spin" size={40} />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6">Start by browsing vendors and requesting a quote</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.new_inquiry;
              const canReview = booking.status === 'completed' && !reviewedIds.has(booking.id);
              return (
                <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {booking.vendor?.profileImageUrl ? (
                        <img
                          src={booking.vendor.profileImageUrl}
                          alt={booking.vendor.businessName}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-purple-600">
                            {booking.vendor?.businessName?.[0] || 'V'}
                          </span>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{booking.vendor?.businessName || 'Vendor'}</h3>
                        <p className="text-sm text-purple-600 font-medium">{booking.vendor?.category}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                          {booking.eventDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(booking.eventDate)}
                            </div>
                          )}
                          {booking.eventType && <span>{booking.eventType}</span>}
                          {booking.guestCount && (
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              {booking.guestCount} guests
                            </div>
                          )}
                          {booking.package && (
                            <div className="flex items-center gap-1">
                              <Package size={14} />
                              {booking.package.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      {booking.totalPrice && (
                        <p className="text-lg font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
                      )}
                      {canReview && (
                        <button
                          onClick={() => setReviewingBooking(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                        >
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          Leave a Review
                        </button>
                      )}
                      {reviewedIds.has(booking.id) && (
                        <span className="text-xs text-gray-500">Review submitted ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
