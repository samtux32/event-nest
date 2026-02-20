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
  Share2,
  Check,
  Calendar,
  MessageCircle,
  Award,
  Clock,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Sparkles
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

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
        alert(data.error || 'Failed to start conversation');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      router.push(`/login?redirectTo=/vendor-profile/${vendorId}`);
      return;
    }
    setRequestingQuote(true);
    try {
      // Create/find conversation
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      if (!convRes.ok) {
        const data = await convRes.json();
        alert(data.error || 'Failed to start conversation');
        return;
      }
      const { conversation } = await convRes.json();
      // Send opening message
      await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "Hi, I'd like to discuss a custom quote for my event." }),
      });
      router.push(`/customer-messages?conv=${conversation.id}`);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setRequestingQuote(false);
    }
  };

  const isOwner = user && vendor && user.id === vendor.userId;

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

        <div className="max-w-7xl mx-auto px-6">
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

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="col-span-2 space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Event Nest" className="w-12 h-12 rounded-xl object-cover" />
                <div className="font-bold text-sm leading-tight">Event<br/>Nest</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleWishlist}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Heart
                  size={20}
                  className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
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
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <div className="relative -mt-32 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-6">
              {vendor.profileImageUrl ? (
                <img
                  src={vendor.profileImageUrl}
                  alt={vendor.businessName}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-purple-100 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-purple-600">
                    {vendor.businessName?.[0] || 'V'}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      {vendor.businessName}
                      {vendor.verificationStatus === 'verified' && (
                        <BadgeCheck className="text-blue-500 flex-shrink-0" size={28} title="Verified vendor" />
                      )}
                    </h1>
                    <p className="text-lg text-purple-600 font-medium mb-1">{vendor.category}</p>
                    {vendor.tagline && <p className="text-gray-600">{vendor.tagline}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  {vendor.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-bold text-gray-900">{Number(vendor.averageRating).toFixed(1)}</span>
                      <span className="text-gray-500">({vendor.totalReviews} reviews)</span>
                    </div>
                  )}
                  {vendor.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />
                      {vendor.location}
                    </div>
                  )}
                  {vendor.responseTime && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={18} />
                      Responds in ~{vendor.responseTime}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-8">
                  {vendor.completedEventsCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{vendor.completedEventsCount}</p>
                      <p className="text-sm text-gray-500">Events completed</p>
                    </div>
                  )}
                  {vendor.yearsExperience && (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{vendor.yearsExperience}</p>
                      <p className="text-sm text-gray-500">Years experience</p>
                    </div>
                  )}
                  {vendor.isAvailable && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">Available for bookings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-8">
            {/* About */}
            {(vendor.description || services.length > 0) && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                {vendor.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
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

            {/* Awards & Recognition */}
            {vendor.awards?.length > 0 && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200">
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
              <section className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                <div className="grid grid-cols-3 gap-4">
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
              <section className="bg-white rounded-2xl p-8 border border-gray-200">
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

                {vendor.totalReviews > vendor.reviews.length && (
                  <button className="w-full mt-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    View all {vendor.totalReviews} reviews
                  </button>
                )}
              </section>
            )}
          </div>

          {/* Right Column - Packages & CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
              {vendor.packages?.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-4">Packages & Pricing</h3>

                  <div className="space-y-4 mb-6">
                    {vendor.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        } ${pkg.isPopular ? 'ring-2 ring-purple-600 ring-offset-2' : ''}`}
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
                </>
              )}

              <Link href={`/booking/${vendorId}`} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors mb-3 flex items-center justify-center gap-2">
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
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {requestingQuote
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Sparkles size={18} />
                  }
                  {requestingQuote ? 'Opening chat...' : 'Request Custom Quote'}
                </button>
              )}

              {vendor.responseTime && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Response time: ~{vendor.responseTime}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
