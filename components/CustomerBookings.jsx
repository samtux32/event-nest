'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarDays,
  Users,
  Package,
  Loader2,
  Star,
  X,
  ImagePlus,
  Trash2,
  FolderOpen,
  Check,
  Link2,
  Unlink,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/components/AuthProvider';
import ConfirmModal from './ConfirmModal';
import AddToCalendarButton from './AddToCalendarButton';

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

const calendarDotColor = {
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  new_inquiry: 'bg-purple-500',
  pending: 'bg-purple-500',
  cancelled: 'bg-gray-400',
};

function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);
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
  const { isVendor, activeMode } = useAuth();
  const asCustomerParam = isVendor && activeMode === 'customer' ? '?as=customer' : '';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [linkingBookingId, setLinkingBookingId] = useState(null); // booking id currently showing plan picker
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth());
  });
  const [selectedDay, setSelectedDay] = useState(null); // day number clicked in calendar

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch(`/api/bookings${asCustomerParam}${asCustomerParam ? '&' : '?'}limit=20`);
        const data = await res.json();
        if (res.ok) {
          setBookings(data.bookings);
          setHasMore(data.hasMore ?? false);
          setOffset(data.bookings.length);
          // Seed reviewedIds from server data so the button doesn't reappear on refresh
          const alreadyReviewed = new Set(data.bookings.filter(b => b.review).map(b => b.id));
          setReviewedIds(alreadyReviewed);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
    // Fetch saved plans for linking
    fetch('/api/saved-plans')
      .then(r => r.json())
      .then(d => setSavedPlans((d.plans || []).filter(p => p.totalBudget)))
      .catch(() => {});
  }, []);

  const loadMoreBookings = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/bookings${asCustomerParam}${asCustomerParam ? '&' : '?'}limit=20&offset=${offset}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => [...prev, ...data.bookings]);
        setHasMore(data.hasMore ?? false);
        setOffset(prev => prev + data.bookings.length);
        const newReviewed = data.bookings.filter(b => b.review).map(b => b.id);
        if (newReviewed.length > 0) {
          setReviewedIds(prev => new Set([...prev, ...newReviewed]));
        }
      }
    } catch (err) {
      console.error('Failed to load more bookings:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds(prev => new Set([...prev, bookingId]));
  };

  const handleLinkPlan = async (bookingId, planId) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, savedPlanId: planId }),
      });
      if (res.ok) {
        const plan = planId ? savedPlans.find(p => p.id === planId) : null;
        setBookings(prev => prev.map(b => b.id === bookingId
          ? { ...b, savedPlanId: planId, savedPlan: plan ? { id: plan.id, title: plan.title } : null }
          : b
        ));
      }
    } catch (err) {
      console.error('Failed to link booking to plan:', err);
    }
    setLinkingBookingId(null);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
    }
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

      <AppHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-600">Track your vendor inquiries and confirmed bookings</p>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 self-start">
            <button
              onClick={() => { setViewMode('list'); setSelectedDay(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDays size={16} />
              Calendar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto mb-4 text-purple-600 animate-spin" size={40} />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't load bookings</h2>
            <p className="text-gray-500 mb-6">Please check your connection and try again</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
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
        ) : viewMode === 'calendar' ? (
          /* ============ CALENDAR VIEW ============ */
          (() => {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];
            const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
            const firstDayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
            // Shift so Monday=0 (Mon-Sun layout)
            const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
            const calendarCells = [];
            for (let i = 0; i < startOffset; i++) calendarCells.push(null);
            for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

            const isSameDay = (d1, d2) =>
              d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

            const getBookingsForDay = (day) => {
              const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
              return bookings.filter(b => b.eventDate && isSameDay(new Date(b.eventDate), date));
            };

            const isToday = (day) => {
              const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
              return isSameDay(date, new Date());
            };

            const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

            return (
              <div>
                {/* Calendar card */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1)); setSelectedDay(null); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1)); setSelectedDay(null); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
                        <span className="hidden sm:inline">{d}</span>
                        <span className="sm:hidden">{d[0]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarCells.map((day, idx) => {
                      if (day === null) return <div key={idx} className="aspect-square" />;
                      const dayBookings = getBookingsForDay(day);
                      const today = isToday(day);
                      const isSelected = selectedDay === day;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDay(dayBookings.length > 0 ? day : null)}
                          className={`aspect-square border rounded-lg p-1 sm:p-2 transition-all flex flex-col items-center ${
                            isSelected ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' :
                            today ? 'border-purple-600 bg-purple-50' :
                            dayBookings.length > 0 ? 'border-gray-200 hover:border-purple-300 cursor-pointer' :
                            'border-gray-100'
                          }`}
                        >
                          <span className={`text-xs sm:text-sm font-semibold ${
                            today ? 'text-purple-600' : isSelected ? 'text-purple-700' : 'text-gray-900'
                          }`}>
                            {day}
                          </span>
                          {dayBookings.length > 0 && (
                            <div className="flex gap-0.5 mt-0.5 sm:mt-1 flex-wrap justify-center">
                              {dayBookings.slice(0, 3).map((b, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${calendarDotColor[b.status] || 'bg-gray-400'}`}
                                />
                              ))}
                              {dayBookings.length > 3 && (
                                <span className="text-[8px] sm:text-[10px] text-gray-400 leading-none">+{dayBookings.length - 3}</span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-xs sm:text-sm text-gray-600">Pending / Inquiry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600">Cancelled</span>
                    </div>
                  </div>
                </div>

                {/* Selected day detail */}
                {selectedDay && selectedDayBookings.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedDay).toLocaleDateString('en-GB', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </h3>
                    <div className="space-y-3">
                      {selectedDayBookings.map(booking => {
                        const status = statusConfig[booking.status] || statusConfig.new_inquiry;
                        const canReview = booking.status === 'completed' && !reviewedIds.has(booking.id);
                        return (
                          <div key={booking.id} className="bg-white rounded-2xl p-5 border border-gray-200">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                              <div className="flex items-start gap-4">
                                {booking.vendor?.profileImageUrl ? (
                                  <img
                                    src={booking.vendor.profileImageUrl}
                                    alt={booking.vendor.businessName}
                                    className="w-12 h-12 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <span className="text-lg font-bold text-purple-600">
                                      {booking.vendor?.businessName?.[0] || 'V'}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-base font-bold text-gray-900">{booking.vendor?.businessName || 'Vendor'}</h4>
                                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                    {booking.eventType && <span>{booking.eventType}</span>}
                                    {booking.totalPrice && (
                                      <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                                <AddToCalendarButton booking={booking} role="customer" />
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
                                  <span className="text-xs text-gray-500">Review submitted</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* ============ LIST VIEW (existing) ============ */
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.new_inquiry;
              const canReview = booking.status === 'completed' && !reviewedIds.has(booking.id);
              const canCancel = ['new_inquiry', 'pending'].includes(booking.status);
              return (
                <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between flex-wrap gap-3">
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
                      <AddToCalendarButton booking={booking} role="customer" />
                      {canCancel && (
                        <button
                          onClick={() => setCancellingBookingId(booking.id)}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plan link */}
                  {savedPlans.length > 0 && booking.status !== 'cancelled' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {booking.savedPlan ? (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-purple-600">
                            <FolderOpen size={12} />
                            Linked to <span className="font-medium">{booking.savedPlan.title}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setLinkingBookingId(linkingBookingId === booking.id ? null : booking.id)}
                              className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
                            >
                              Change
                            </button>
                            <button
                              onClick={() => handleLinkPlan(booking.id, null)}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Unlink size={11} />
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLinkingBookingId(linkingBookingId === booking.id ? null : booking.id)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          <Link2 size={12} />
                          Link to a plan
                        </button>
                      )}

                      {linkingBookingId === booking.id && (
                        <div className="mt-2 space-y-1.5">
                          {savedPlans.map(plan => (
                            <button
                              key={plan.id}
                              onClick={() => handleLinkPlan(booking.id, plan.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                                booking.savedPlanId === plan.id
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700'
                              }`}
                            >
                              <FolderOpen size={14} className={booking.savedPlanId === plan.id ? 'text-purple-600' : 'text-gray-400'} />
                              <span className="flex-1 truncate">{plan.title}</span>
                              <span className="text-xs text-gray-400">£{Number(plan.totalBudget).toLocaleString('en-GB')}</span>
                              {booking.savedPlanId === plan.id && <Check size={14} className="text-purple-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMoreBookings}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More Bookings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {cancellingBookingId && (
        <ConfirmModal
          title="Cancel booking?"
          message="Are you sure you want to cancel this booking? Please check the vendor's cancellation policy before proceeding."
          confirmLabel="Cancel Booking"
          onConfirm={() => { handleCancelBooking(cancellingBookingId); setCancellingBookingId(null); }}
          onCancel={() => setCancellingBookingId(null)}
        />
      )}
    </div>
  );
}
