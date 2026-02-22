'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  Check,
  Calendar,
  MessageCircle,
  Award,
  Clock,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Globe
} from 'lucide-react';

function formatPrice(decimal) {
  const num = Number(decimal);
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function VendorPublicProfile({ vendorId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [requestingQuote, setRequestingQuote] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [starFilter, setStarFilter] = useState(null);

  // Load wishlist state for this vendor
  useEffect(() => {
    if (!user) return;
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(data => {
        if (data.vendorIds) setIsWishlisted(data.vendorIds.includes(vendorId));
      })
      .catch(() => {});
  }, [user, vendorId]);

  const toggleWishlist = async () => {
    if (!user) { router.push(`/login?redirectTo=/vendor-profile/${vendorId}`); return; }
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      await fetch('/api/wishlist', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
    } catch {
      setIsWishlisted(!next);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      router.push(`/login?redirectTo=/vendor-profile/${vendorId}`);
      return;
    }
    setActionError(null);
    setSendingMessage(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/customer-messages?conv=${data.conversation.id}`);
      } else {
        setActionError(data.error || 'Failed to start conversation');
      }
    } catch {
      setActionError('Something went wrong. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      router.push(`/login?redirectTo=/vendor-profile/${vendorId}`);
      return;
    }
    setActionError(null);
    setRequestingQuote(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      const data = await res.json();
      if (res.ok) {
        // Auto-send an opening message so the vendor knows it's a quote request
        await fetch(`/api/conversations/${data.conversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `Hi! I'd love to discuss a custom quote with you. Could you let me know your availability and pricing for my event?` }),
        });
        router.push(`/customer-messages?conv=${data.conversation.id}`);
      } else {
        setActionError(data.error || 'Failed to start conversation');
      }
    } catch {
      setActionError('Something went wrong. Please try again.');
    } finally {
      setRequestingQuote(false);
    }
  };

  const isOwner = user && vendor && user.id === vendor.userId;

  const loadAllReviews = async (rating = null) => {
    setReviewsLoading(true);
    try {
      const url = `/api/reviews?vendorId=${vendorId}${rating ? `&rating=${rating}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.reviews) setAllReviews(data.reviews);
    } catch {}
    setReviewsLoading(false);
  };

  const handleViewAllReviews = () => {
    setShowReviewsModal(true);
    setStarFilter(null);
    loadAllReviews(null);
  };

  const handleStarFilter = (rating) => {
    const next = starFilter === rating ? null : rating;
    setStarFilter(next);
    loadAllReviews(next);
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to submit reply'); return; }
      setVendor(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r.id === reviewId ? { ...r, reply: data.reply } : r),
      }));
      setReplyingTo(null);
      setReplyText('');
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await fetch(`/api/vendors/${vendorId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load vendor profile');
          return;
        }

        setVendor(data.vendor);

        // Track profile view (fire and forget)
        fetch('/api/profile-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId, source: 'direct_link' }),
        }).catch(() => {});
      } catch {
        setError('Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  // Derive services from package features
  const services = vendor?.packages?.length
    ? [...new Set(vendor.packages.flatMap(pkg => pkg.features))]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Event Nest" className="w-12 h-12 rounded-xl object-cover" />
                <div className="font-bold text-sm leading-tight">Event<br/>Nest</div>
              </div>
            </div>
          </div>
        </header>

        <div className="h-96 bg-gray-200 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-32 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
                  <div className="flex gap-6">
                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="col-span-2 space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl mb-4 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Event Nest" className="w-12 h-12 rounded-xl object-cover" />
                <div className="font-bold text-sm leading-tight">Event<br/>Nest</div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Event Nest" className="w-9 h-9 rounded-lg object-cover" />
              <span className="font-bold text-gray-900 text-base">Event Nest</span>
            </div>
          </div>

          <button
            onClick={toggleWishlist}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Heart
              size={20}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-96 bg-gray-200">
        {vendor.coverImageUrl ? (
          <img
            src={vendor.coverImageUrl}
            alt={vendor.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="relative -mt-32 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              {vendor.profileImageUrl ? (
                <img
                  src={vendor.profileImageUrl}
                  alt={vendor.businessName}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl bg-purple-100 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl sm:text-4xl font-bold text-purple-600">
                    {vendor.businessName?.[0] || 'V'}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
                  <span className="truncate">{vendor.businessName}</span>
                  {vendor.verificationStatus === 'verified' && (
                    <BadgeCheck className="text-blue-500 flex-shrink-0" size={24} title="Verified vendor" />
                  )}
                </h1>
                <p className="text-base sm:text-lg text-purple-600 font-medium mb-1">{vendor.category}</p>
                {vendor.tagline && <p className="text-gray-600 text-sm sm:text-base break-words">{vendor.tagline}</p>}

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 mb-3">
                  {vendor.averageRating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="font-bold text-gray-900 text-sm">{Number(vendor.averageRating).toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({vendor.totalReviews})</span>
                    </div>
                  )}
                  {vendor.location && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <MapPin size={14} />
                      <span className="truncate max-w-[140px] sm:max-w-none">{vendor.location}</span>
                    </div>
                  )}
                  {vendor.responseTime && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Clock size={14} />
                      <span className="whitespace-nowrap">~{vendor.responseTime}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                  {vendor.completedEventsCount > 0 && (
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{vendor.completedEventsCount}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Events completed</p>
                    </div>
                  )}
                  {vendor.yearsExperience && (
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{vendor.yearsExperience}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Years experience</p>
                    </div>
                  )}
                  {vendor.isAvailable && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm font-medium text-green-700 whitespace-nowrap">Available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* About */}
            {(vendor.description || services.length > 0) && (
              <section className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                {vendor.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words mb-6">
                    {vendor.description}
                  </p>
                )}

                {services.length > 0 && (
                  <>
                    <h3 className="font-bold text-lg mb-3">What we offer:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="text-purple-600 flex-shrink-0" size={18} />
                          <span className="text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Cancellation Policy */}
            {vendor.cancellationPolicy && (
              <section className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-amber-500" size={24} />
                  <h2 className="text-2xl font-bold">Cancellation Policy</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{vendor.cancellationPolicy}</p>
              </section>
            )}

            {/* Awards & Recognition */}
            {vendor.awards?.length > 0 && (
              <section className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-purple-600" size={24} />
                  <h2 className="text-2xl font-bold">Awards & Recognition</h2>
                </div>
                <div className="space-y-2">
                  {vendor.awards.map((award) => (
                    <div key={award.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="text-purple-600" size={16} />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {award.title}{award.year ? ` (${award.year})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {vendor.portfolioImages?.length > 0 && (
              <section className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendor.portfolioImages.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.caption || 'Portfolio image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {vendor.reviews?.length > 0 && (
              <section className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Reviews ({vendor.totalReviews})</h2>
                  {vendor.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400 fill-yellow-400" size={24} />
                      <span className="text-3xl font-bold">{Number(vendor.averageRating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {vendor.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{review.customer?.fullName || 'Anonymous'}</p>
                          {review.eventDate && (
                            <p className="text-sm text-gray-500">Event: {review.eventDate}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">{review.text}</p>
                      {review.photos?.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.photos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Review photo"
                              className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>

                      {/* Existing vendor reply */}
                      {review.reply && (
                        <div className="mt-4 ml-4 pl-4 border-l-2 border-purple-200 bg-purple-50 rounded-r-xl p-4">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Business response</p>
                          <p className="text-sm text-gray-700">{review.reply.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(review.reply.createdAt)}</p>
                        </div>
                      )}

                      {/* Vendor reply form */}
                      {isOwner && !review.reply && (
                        replyingTo === review.id ? (
                          <div className="mt-4">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Write your response to this review..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-600 resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={submittingReply || !replyText.trim()}
                                onClick={() => handleReply(review.id)}
                                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                              >
                                {submittingReply ? 'Submitting...' : 'Submit response'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                            className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Respond to this review
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {vendor.totalReviews > 0 && (
                  <button
                    onClick={handleViewAllReviews}
                    className="w-full mt-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View all {vendor.totalReviews} reviews
                  </button>
                )}
              </section>
            )}
          </div>

          {/* Right Column - Packages & CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 lg:sticky lg:top-24">
              {vendor.packages?.length > 0 && (
                <h3 className="text-xl font-bold mb-4">Packages & Pricing</h3>
              )}

              <div className="lg:max-h-[36rem] lg:overflow-y-auto lg:pr-1">
                {vendor.packages?.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {vendor.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(prev => prev === pkg.id ? null : pkg.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        {pkg.isPopular && (
                          <div className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full mb-2">
                            MOST POPULAR
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{pkg.name}</h4>
                            {pkg.duration && (
                              <p className="text-sm text-gray-500">{pkg.duration} coverage</p>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-purple-600">{formatPrice(pkg.price)}</p>
                        </div>
                        {pkg.features?.length > 0 && (
                          <ul className="space-y-2 mt-3">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <Check size={16} className="text-purple-600 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {isOwner ? (
                    <Link href="/vendor-dashboard" className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href={`/booking/${vendorId}`} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <Calendar size={20} />
                        Request Quote
                      </Link>

                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage}
                        className="w-full border-2 border-purple-600 text-purple-600 py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {sendingMessage ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
                        {sendingMessage ? 'Opening...' : 'Send Message'}
                      </button>

                      {vendor.customQuotesEnabled && (
                        <button
                          onClick={handleRequestQuote}
                          disabled={requestingQuote}
                          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {requestingQuote ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                          {requestingQuote ? 'Opening...' : 'Request Custom Quote'}
                        </button>
                      )}

                      {actionError && (
                        <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {vendor.responseTime && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Response time: ~{vendor.responseTime}
                </p>
              )}

              {/* Social Links — inside sticky card so always visible */}
              {(vendor.instagram || vendor.facebook || vendor.twitter || vendor.tiktok || vendor.website) && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Find Us Online</p>
                  <div className="space-y-2.5">
                    {vendor.instagram && (
                      <a
                        href={vendor.instagram.startsWith('http') ? vendor.instagram : `https://instagram.com/${vendor.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Instagram size={16} className="text-white" />
                        </div>
                        <span className="text-sm group-hover:underline truncate">
                          {vendor.instagram.startsWith('http') ? vendor.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, '@') : (vendor.instagram.startsWith('@') ? vendor.instagram : `@${vendor.instagram}`)}
                        </span>
                      </a>
                    )}
                    {vendor.facebook && (
                      <a
                        href={vendor.facebook.startsWith('http') ? vendor.facebook : `https://facebook.com/${vendor.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Facebook size={16} className="text-white" />
                        </div>
                        <span className="text-sm group-hover:underline truncate">
                          {vendor.facebook.startsWith('http') ? vendor.facebook.replace(/https?:\/\/(www\.)?facebook\.com\//, '') : vendor.facebook}
                        </span>
                      </a>
                    )}
                    {vendor.twitter && (
                      <a
                        href={vendor.twitter.startsWith('http') ? vendor.twitter : `https://x.com/${vendor.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                          <Twitter size={16} className="text-white" />
                        </div>
                        <span className="text-sm group-hover:underline truncate">
                          {vendor.twitter.startsWith('http') ? vendor.twitter.replace(/https?:\/\/(www\.)?(twitter|x)\.com\//, '@') : (vendor.twitter.startsWith('@') ? vendor.twitter : `@${vendor.twitter}`)}
                        </span>
                      </a>
                    )}
                    {vendor.tiktok && (
                      <a
                        href={vendor.tiktok.startsWith('http') ? vendor.tiktok : `https://tiktok.com/@${vendor.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.02a4.85 4.85 0 0 1-1-.33z"/>
                          </svg>
                        </div>
                        <span className="text-sm group-hover:underline truncate">
                          {vendor.tiktok.startsWith('http') ? vendor.tiktok.replace(/https?:\/\/(www\.)?tiktok\.com\/@?/, '@') : (vendor.tiktok.startsWith('@') ? vendor.tiktok : `@${vendor.tiktok}`)}
                        </span>
                      </a>
                    )}
                    {vendor.website && (
                      <a
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe size={16} className="text-purple-600" />
                        </div>
                        <span className="text-sm group-hover:underline truncate">
                          {vendor.website.replace(/https?:\/\/(www\.)?/, '')}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Reviews Modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Reviews</h2>
                <p className="text-sm text-gray-500">{vendor.totalReviews} review{vendor.totalReviews !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Star filter */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="text-sm font-medium text-gray-600 mr-1">Filter:</span>
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => handleStarFilter(star)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    starFilter === star
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {star}<Star size={12} className={starFilter === star ? 'fill-white text-white' : 'fill-yellow-400 text-yellow-400'} />
                </button>
              ))}
              {starFilter && (
                <button
                  onClick={() => handleStarFilter(null)}
                  className="text-xs text-purple-600 hover:underline ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Reviews list */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-purple-600" size={32} />
                </div>
              ) : allReviews.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Star className="mx-auto mb-3" size={32} />
                  <p>No reviews{starFilter ? ` with ${starFilter} star${starFilter !== 1 ? 's' : ''}` : ''}</p>
                </div>
              ) : (
                allReviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{review.customer?.fullName || 'Anonymous'}</p>
                        {review.eventDate && <p className="text-sm text-gray-500">Event: {review.eventDate}</p>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-2">{review.text}</p>
                    {review.photos?.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {review.photos.map((url, i) => (
                          <img key={i} src={url} alt="Review photo" className="w-16 h-16 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                    {review.reply && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-purple-200 bg-purple-50 rounded-r-xl p-3">
                        <p className="text-xs font-semibold text-purple-700 mb-1">Business response</p>
                        <p className="text-sm text-gray-700">{review.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
