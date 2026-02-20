'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import PackageSelector from '@/components/PackageSelector';
import EventDetailsForm from '@/components/EventDetailsForm';
import AdditionalServices from '@/components/AdditionalServices';
import ContactInformation from '@/components/ContactInformation';
import BookingSummary from '@/components/BookingSummary';

function formatPrice(decimal) {
  const num = Number(decimal);
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function BookingRequest({ vendorId }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    eventType: 'Wedding',
    guestCount: '',
    venueName: '',
    venueAddress: '',
    startTime: '',
    endTime: '',
    additionalServices: [],
    specialRequests: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    hearAbout: ''
  });

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await fetch(`/api/vendors/${vendorId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load vendor');
          return;
        }

        const v = data.vendor;

        // Map to the shape BookingSummary and PackageSelector expect
        const mapped = {
          id: v.id,
          name: v.businessName,
          category: v.category,
          rating: v.averageRating ? Number(v.averageRating) : null,
          reviews: v.totalReviews,
          location: v.location,
          responseTime: v.responseTime,
          profileImage: v.profileImageUrl,
          packages: v.packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            price: formatPrice(pkg.price),
            duration: pkg.duration,
            popular: pkg.isPopular,
            features: pkg.features,
          })),
        };

        setVendor(mapped);

        // Default to the popular package, or the first one
        const popular = mapped.packages.find((p) => p.popular);
        setSelectedPackage(popular?.id || mapped.packages[0]?.id || null);
      } catch {
        setError('Failed to load vendor');
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [vendorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push(`/login?redirectTo=/booking/${vendorId}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          packageId: selectedPackage,
          ...formData,
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to submit booking');
        return;
      }

      router.push('/my-bookings');
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-96 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="h-20 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-40 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Available</h1>
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
              <Link href={`/vendor-profile/${vendorId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Event Nest" className="w-12 h-12 rounded-xl object-cover" />
                <div className="font-bold text-sm leading-tight">Event<br/>Nest</div>
              </div>
            </div>

            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Request a Quote</h1>
          <p className="text-gray-600">Tell us about your event and we'll get back to you soon</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package Selection */}
              <PackageSelector
                packages={vendor.packages}
                selectedPackage={selectedPackage}
                onSelectPackage={setSelectedPackage}
              />

              {/* Event Details */}
              <EventDetailsForm
                formData={formData}
                onFormChange={handleInputChange}
              />

              {/* Additional Services */}
              <AdditionalServices
                selectedServices={formData.additionalServices}
                onToggleService={handleServiceToggle}
              />

              {/* Special Requests */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Special Requests or Notes</h2>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Tell the vendor about any special requirements, preferences, or questions you have..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Contact Information */}
              <ContactInformation
                formData={formData}
                onFormChange={handleInputChange}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={20} className="animate-spin" />}
                {submitting ? 'Sending...' : 'Send Quote Request'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this request, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div>
            <BookingSummary
              vendor={vendor}
              selectedPackage={selectedPackage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
