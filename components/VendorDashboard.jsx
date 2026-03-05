'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';

import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/components/AuthProvider';
import {
  MessageSquare,
  CalendarDays,
  Clock,
  DollarSign,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Check,
  ArrowRight,
  Star,
  X,
  Copy,
  Users,
  Share2
} from 'lucide-react';
import AddToCalendarButton from './AddToCalendarButton';

function formatPrice(val) {
  const num = Number(val);
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusColors = {
  new_inquiry: 'bg-purple-100 text-purple-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  new_inquiry: 'New',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function ReviewCustomerModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    if (!text.trim()) { setError('Please write a review'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/customer-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, rating, text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit review'); return; }
      onSubmitted(booking.id);
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="review-modal-title" className="text-lg font-bold text-gray-900">
            Review {booking.customer?.fullName || 'Customer'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-0.5"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              placeholder="How was your experience working with this customer?"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  const { profile: authProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ newInquiries: 0, upcomingBookings: 0, completedEvents: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [completionSteps, setCompletionSteps] = useState([]);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes, profileRes] = await Promise.all([
          fetch('/api/bookings/stats'),
          fetch('/api/bookings?limit=20'),
          fetch('/api/vendors/profile'),
        ]);
        const [statsData, bookingsData] = await Promise.all([statsRes.json(), bookingsRes.json()]);
        if (statsRes.ok) setStats(statsData);
        if (bookingsRes.ok) {
          setBookings(bookingsData.bookings);
          setHasMore(bookingsData.hasMore ?? false);
          setOffset(bookingsData.bookings.length);
        }
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const p = profileData.vendor || profileData;
          // Calculate completion steps
          const steps = [
            { label: 'Business Info', done: !!(p.businessName && p.description && p.location), field: 'businessName' },
            { label: 'Photos', done: !!(p.profileImageUrl || (p.portfolioImages && p.portfolioImages.length > 0)), field: 'photos' },
            { label: 'Pricing', done: !!(p.packages && p.packages.length > 0), field: 'packages' },
            { label: 'Portfolio', done: !!(p.portfolioImages && p.portfolioImages.length >= 3), field: 'portfolio' },
            { label: 'Contact', done: !!(p.contactEmail || p.contactPhone || p.website), field: 'contact' },
            { label: 'Categories', done: !!(p.categories && p.categories.length > 0), field: 'categories' },
          ];
          setCompletionSteps(steps);
          const pct = Math.round((steps.filter(s => s.done).length / steps.length) * 100);
          setProfileCompletion(pct);
          if (p.referralCode) setReferralCode(p.referralCode);
          if (p.referralCount !== undefined) setReferralCount(p.referralCount);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // Check localStorage for dismiss
    if (typeof window !== 'undefined' && localStorage.getItem('onboarding-dismissed') === 'true') {
      setOnboardingDismissed(true);
    }
  }, []);

  const loadMoreInquiries = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/bookings?limit=20&offset=${offset}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => [...prev, ...data.bookings]);
        setHasMore(data.hasMore ?? false);
        setOffset(prev => prev + data.bookings.length);
      }
    } catch (err) {
      console.error('Failed to load more inquiries:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const { newInquiries, upcomingBookings, completedEvents, totalRevenue } = stats;

  // Show new_inquiry and pending bookings in the inquiries list
  const activeInquiries = bookings.filter(b => b.status === 'new_inquiry' || b.status === 'pending');

  const acceptBooking = async (booking) => {
    setUpdatingId(booking.id);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: 'confirmed' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: 'confirmed', confirmedAt: new Date().toISOString() } : b
        ));
        if (selectedInquiry?.id === booking.id) setSelectedInquiry(null);
      }
    } catch (err) {
      console.error('Failed to accept booking:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteProfile = () => {};

  return (
    <div className="min-h-screen bg-gray-50">
    <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {authProfile?.isApproved === false && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Your profile is pending approval</p>
              <p className="text-sm text-amber-700">Your profile is not yet visible in the marketplace. An admin will review and approve it shortly.</p>
            </div>
          </div>
        )}

        {/* Onboarding Progress Card */}
        {profileCompletion !== null && profileCompletion < 100 && !onboardingDismissed && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 mt-0.5">A complete profile attracts more bookings</p>
              </div>
              <button
                onClick={() => {
                  setOnboardingDismissed(true);
                  localStorage.setItem('onboarding-dismissed', 'true');
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Dismiss
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-sm font-bold text-purple-700">{profileCompletion}%</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {completionSteps.map((step) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    step.done
                      ? 'bg-green-50 text-green-700'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {step.done ? (
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/profile-editor"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Complete Profile <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Welcome back, {authProfile?.businessName || 'Vendor'} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your business</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Link href="/messages" className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">New Inquiries</p>
                <p className="text-3xl sm:text-5xl font-bold">{newInquiries}</p>
                <p className="text-gray-500 text-sm mt-2">Awaiting response</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="text-purple-600" size={24} />
              </div>
            </div>
          </Link>

          <Link href="/calendar" className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Upcoming Bookings</p>
                <p className="text-3xl sm:text-5xl font-bold">{upcomingBookings}</p>
                <p className="text-gray-500 text-sm mt-2">Events scheduled</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="text-blue-600" size={24} />
              </div>
            </div>
          </Link>

          <Link href="/analytics" className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl sm:text-5xl font-bold">{formatPrice(totalRevenue)}</p>
                <p className="text-gray-500 text-sm mt-2">All time earnings</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </Link>

          <Link href="/calendar" className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Completed Events</p>
                <p className="text-3xl sm:text-5xl font-bold">{completedEvents}</p>
                <p className="text-gray-500 text-sm mt-2">Successfully delivered</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Inquiries</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-purple-600 animate-spin" size={32} />
                <p className="text-gray-500">Loading inquiries...</p>
              </div>
            ) : activeInquiries.length > 0 ? (
              activeInquiries.map((iq) => (
                <div
                  key={iq.id}
                  onClick={() => setSelectedInquiry(iq)}
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                    selectedInquiry?.id === iq.id
                      ? 'border-purple-600 bg-purple-50 shadow-sm'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {(iq.contactName || iq.customer?.fullName || '?')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{iq.contactName || iq.customer?.fullName || 'Customer'}</p>
                      <p className="text-sm text-gray-500">{formatDate(iq.eventDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-gray-900">{iq.totalPrice ? formatPrice(iq.totalPrice) : '—'}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[iq.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[iq.status] || iq.status}
                      </span>
                    </div>

                    {/* Hide Accept for quote-created bookings — customer accepts the quote instead */}
                    {(iq.contactName || iq.packageId) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptBooking(iq);
                        }}
                        disabled={updatingId === iq.id}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        {updatingId === iq.id && <Loader2 size={14} className="animate-spin" />}
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
                <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
                <p>No active inquiries</p>
              </div>
            )}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMoreInquiries}
                  disabled={loadingMore}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Slide-out Detail Panel */}
        {selectedInquiry && (
          <div className="mt-8 p-6 bg-white border-2 border-purple-600 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Inquiry Details</h3>
                <h2 className="text-2xl font-bold text-gray-900">{selectedInquiry.contactName || selectedInquiry.customer?.fullName || 'Customer'}</h2>
                <p className="text-gray-500 font-medium">
                  {formatDate(selectedInquiry.eventDate)}
                  {selectedInquiry.totalPrice ? ` • ${formatPrice(selectedInquiry.totalPrice)}` : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close inquiry details"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {selectedInquiry.eventType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Event Type</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.eventType}</p>
                </div>
              )}
              {selectedInquiry.guestCount && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Guest Count</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.guestCount}</p>
                </div>
              )}
              {selectedInquiry.venueName && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Venue</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.venueName}</p>
                </div>
              )}
              {selectedInquiry.package && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Package</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.package.name}</p>
                </div>
              )}
            </div>

            {selectedInquiry.specialRequests && (
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                <p className="text-xs text-gray-500 mb-2">Special Requests</p>
                <p className="text-gray-700 leading-relaxed italic">
                  "{selectedInquiry.specialRequests}"
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href={selectedInquiry.conversation?.id ? `/messages?conv=${selectedInquiry.conversation.id}` : '/messages'}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors text-center"
              >
                Send Message
              </Link>
              {(selectedInquiry.contactName || selectedInquiry.packageId) && (
                <button
                  onClick={() => acceptBooking(selectedInquiry)}
                  disabled={updatingId === selectedInquiry.id}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingId === selectedInquiry.id && <Loader2 size={16} className="animate-spin" />}
                  Accept Booking
                </button>
              )}
            </div>
          </div>
        )}
        {/* Completed Events Section */}
        {!loading && bookings.filter(b => b.status === 'completed').length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Completed Events</h2>
            </div>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'completed').map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {(booking.contactName || booking.customer?.fullName || '?')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{booking.contactName || booking.customer?.fullName || 'Customer'}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(booking.eventDate)}
                        {booking.eventType ? ` \u2022 ${booking.eventType}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {booking.totalPrice && (
                      <span className="text-sm font-semibold text-gray-700 hidden sm:block">{formatPrice(booking.totalPrice)}</span>
                    )}
                    <AddToCalendarButton booking={booking} role="vendor" />
                    {booking.customerReview ? (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium flex items-center gap-1">
                        <Check size={12} /> Reviewed
                      </span>
                    ) : (
                      <button
                        onClick={() => setReviewModalBooking(booking)}
                        className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                      >
                        <Star size={14} />
                        Review Customer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Link Card */}
        {referralCode && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Share2 size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Share Your Referral Link</h2>
                <p className="text-sm text-gray-500">Invite other vendors to join Event Nest</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono truncate">
                {(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}/register?ref={referralCode}
              </div>
              <button
                onClick={() => {
                  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?ref=${referralCode}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} className="text-gray-400" />
              <span>
                <span className="font-semibold text-gray-900">{referralCount}</span>{' '}
                vendor{referralCount !== 1 ? 's' : ''} joined using your link
              </span>
            </div>
          </div>
        )}

        {/* Review Customer Modal */}
        {reviewModalBooking && (
          <ReviewCustomerModal
            booking={reviewModalBooking}
            onClose={() => setReviewModalBooking(null)}
            onSubmitted={(bookingId) => {
              setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, customerReview: { id: 'new' } } : b
              ));
            }}
          />
        )}
      </main>
    </div>
  );
}
