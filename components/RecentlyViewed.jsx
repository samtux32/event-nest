'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Loader2, Trash2 } from 'lucide-react';
import CustomerHeader from './CustomerHeader';

const MAX_RECENT = 20;

// Helper to add a vendor ID to recently viewed (call from anywhere)
export function trackVendorView(vendorId) {
  try {
    const stored = JSON.parse(localStorage.getItem('recentlyViewedVendors') || '[]');
    const filtered = stored.filter((item) => item.id !== vendorId);
    filtered.unshift({ id: vendorId, viewedAt: Date.now() });
    localStorage.setItem('recentlyViewedVendors', JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
}

export default function RecentlyViewed() {
  const [recentIds, setRecentIds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewedVendors') || '[]');
      setRecentIds(stored);
    } catch {
      setRecentIds([]);
    }
  }, []);

  useEffect(() => {
    if (recentIds.length === 0) { setVendors([]); setLoading(false); return; }
    async function fetchVendors() {
      const results = await Promise.all(
        recentIds.map(async (item) => {
          try {
            const res = await fetch(`/api/vendors/${item.id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return { ...data, viewedAt: item.viewedAt };
          } catch { return null; }
        })
      );
      setVendors(results.filter(Boolean));
      setLoading(false);
    }
    fetchVendors();
  }, [recentIds]);

  function clearAll() {
    localStorage.removeItem('recentlyViewedVendors');
    setRecentIds([]);
    setVendors([]);
  }

  function removeOne(vendorId) {
    const updated = recentIds.filter((item) => item.id !== vendorId);
    localStorage.setItem('recentlyViewedVendors', JSON.stringify(updated));
    setRecentIds(updated);
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getStartingPrice(vendor) {
    if (vendor.packages?.[0]?.price) return Number(vendor.packages[0].price);
    if (vendor.pricePerDay) return Number(vendor.pricePerDay);
    if (vendor.pricePerHead) return Number(vendor.pricePerHead);
    return null;
  }

  if (loading) {
    return (
      <>
        <CustomerHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recently Viewed</h1>
              <p className="text-gray-500 mt-1">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} viewed recently</p>
            </div>
            {vendors.length > 0 && (
              <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {vendors.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No recently viewed vendors</h2>
              <p className="text-gray-500 mb-6">Vendors you visit will appear here so you can easily find them again.</p>
              <Link
                href="/marketplace"
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm inline-block"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => {
                const price = getStartingPrice(vendor);
                return (
                  <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-200 transition-colors group">
                    <div className="flex items-center gap-4 p-4">
                      {/* Image */}
                      <Link href={`/vendor-profile/${vendor.id}`} className="flex-shrink-0">
                        {vendor.profileImageUrl ? (
                          <img src={vendor.profileImageUrl} alt={vendor.businessName} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                            {vendor.businessName?.[0]}
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/vendor-profile/${vendor.id}`}>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                            {vendor.businessName}
                          </h3>
                        </Link>
                        <p className="text-sm text-purple-600">{vendor.category}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {vendor.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Star size={13} className="text-yellow-500 fill-yellow-500" />
                              {Number(vendor.averageRating).toFixed(1)}
                              <span className="text-gray-400">({vendor.totalReviews})</span>
                            </span>
                          )}
                          {vendor.location && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin size={13} />
                              {vendor.location}
                            </span>
                          )}
                          {price && (
                            <span className="text-sm font-medium text-purple-700">
                              From £{price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time + actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {timeAgo(vendor.viewedAt)}
                        </span>
                        <button
                          onClick={() => removeOne(vendor.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
