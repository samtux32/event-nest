'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, X, Plus, Loader2, ArrowLeft, Check } from 'lucide-react';
import AppHeader from './AppHeader';

export default function VendorCompare() {
  const [vendorIds, setVendorIds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load compare list from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('compareVendors') || '[]');
      setVendorIds(stored);
    } catch {
      setVendorIds([]);
    }
    setLoading(false);
  }, []);

  // Fetch vendor details when IDs change
  useEffect(() => {
    if (vendorIds.length === 0) { setVendors([]); return; }
    async function fetchVendors() {
      const results = await Promise.all(
        vendorIds.map(async (id) => {
          try {
            const res = await fetch(`/api/vendors/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.vendor || data;
          } catch { return null; }
        })
      );
      setVendors(results.filter(Boolean));
    }
    fetchVendors();
  }, [vendorIds]);

  // Search vendors
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/vendors?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.vendors || data).filter(v => !vendorIds.includes(v.id)).slice(0, 5));
        }
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, vendorIds]);

  function addVendor(id) {
    if (vendorIds.length >= 3 || vendorIds.includes(id)) return;
    const updated = [...vendorIds, id];
    setVendorIds(updated);
    localStorage.setItem('compareVendors', JSON.stringify(updated));
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  }

  function removeVendor(id) {
    const updated = vendorIds.filter(v => v !== id);
    setVendorIds(updated);
    localStorage.setItem('compareVendors', JSON.stringify(updated));
  }

  function clearAll() {
    setVendorIds([]);
    setVendors([]);
    localStorage.removeItem('compareVendors');
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
        <AppHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compare Vendors</h1>
              <p className="text-gray-500 mt-1">Compare up to 3 vendors side by side</p>
            </div>
            {vendors.length > 0 && (
              <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {vendors.length === 0 && !showSearch ? (
            /* Empty state */
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No vendors to compare</h2>
              <p className="text-gray-500 mb-6">Add vendors from the marketplace or search below to start comparing.</p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Search Vendors
              </button>
              <Link href="/marketplace" className="block mt-3 text-sm text-purple-600 hover:text-purple-700">
                or browse the marketplace
              </Link>
            </div>
          ) : (
            <>
              {/* Comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header image */}
                    <div className="relative h-32">
                      {vendor.coverImageUrl ? (
                        <img src={vendor.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
                      )}
                      <button
                        onClick={() => removeVendor(vendor.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>
                      {vendor.profileImageUrl && (
                        <img
                          src={vendor.profileImageUrl}
                          alt={vendor.businessName}
                          className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl object-cover border-2 border-white"
                        />
                      )}
                    </div>

                    <div className="p-4 pt-8">
                      <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                      <p className="text-sm text-purple-600">{Array.isArray(vendor.categories) ? vendor.categories.join(', ') : vendor.category}</p>
                    </div>
                  </div>
                ))}

                {/* Add vendor slot */}
                {vendors.length < 3 && (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[200px] hover:border-purple-400 hover:bg-purple-50/50 transition-colors group"
                  >
                    <Plus size={24} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm text-gray-500 group-hover:text-purple-600 mt-2 transition-colors">Add vendor</span>
                  </button>
                )}
              </div>

              {/* Search modal */}
              {showSearch && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Search vendors to add</h3>
                    <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or category..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                  {searching && <Loader2 className="w-5 h-5 animate-spin text-purple-600 mt-3 mx-auto" />}
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {searchResults.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => addVendor(v.id)}
                          disabled={vendorIds.length >= 3}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          {(v.profileImageUrl || v.image) ? (
                            <img src={v.profileImageUrl || v.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                              {(v.businessName || v.name)?.[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{v.businessName || v.name}</p>
                            <p className="text-xs text-gray-500">{Array.isArray(v.categories) ? v.categories.join(', ') : v.category}</p>
                          </div>
                          <Plus size={16} className="text-purple-600 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comparison table */}
              {vendors.length >= 2 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-sm font-medium text-gray-500 px-5 py-3 w-40">Feature</th>
                          {vendors.map((v) => (
                            <th key={v.id} className="text-left text-sm font-medium text-gray-900 px-5 py-3">
                              {v.businessName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <CompareRow label="Category" vendors={vendors} render={(v) => Array.isArray(v.categories) ? v.categories.join(', ') : v.category} />
                        <CompareRow
                          label="Rating"
                          vendors={vendors}
                          render={(v) =>
                            v.averageRating ? (
                              <span className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                {Number(v.averageRating).toFixed(1)}
                                <span className="text-gray-400">({v.totalReviews})</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">No reviews</span>
                            )
                          }
                        />
                        <CompareRow
                          label="Location"
                          vendors={vendors}
                          render={(v) =>
                            v.location ? (
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-gray-400" />
                                {v.location}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )
                          }
                        />
                        <CompareRow
                          label="Starting Price"
                          vendors={vendors}
                          render={(v) => {
                            const price = getStartingPrice(v);
                            return price ? (
                              <span className="font-medium text-purple-700">£{price.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-400">Contact for price</span>
                            );
                          }}
                        />
                        <CompareRow
                          label="Response Time"
                          vendors={vendors}
                          render={(v) =>
                            v.responseTime ? `~${v.responseTime}` : <span className="text-gray-400">-</span>
                          }
                        />
                        <CompareRow
                          label="Experience"
                          vendors={vendors}
                          render={(v) =>
                            v.yearsExperience ? `${v.yearsExperience} years` : <span className="text-gray-400">-</span>
                          }
                        />
                        <CompareRow
                          label="Events Done"
                          vendors={vendors}
                          render={(v) =>
                            v.completedEventsCount ? v.completedEventsCount.toLocaleString() : <span className="text-gray-400">-</span>
                          }
                        />
                        <CompareRow
                          label="Packages"
                          vendors={vendors}
                          render={(v) =>
                            v.packages?.length ? `${v.packages.length} package${v.packages.length !== 1 ? 's' : ''}` : <span className="text-gray-400">None</span>
                          }
                        />
                        <CompareRow
                          label="Custom Quotes"
                          vendors={vendors}
                          render={(v) =>
                            v.customQuotesEnabled ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <span className="text-gray-400">No</span>
                            )
                          }
                        />
                        <CompareRow
                          label="Cancellation"
                          vendors={vendors}
                          render={(v) => v.cancellationPolicy || <span className="text-gray-400">-</span>}
                        />
                        {/* View profile links */}
                        <tr className="border-t border-gray-100">
                          <td className="px-5 py-4" />
                          {vendors.map((v) => (
                            <td key={v.id} className="px-5 py-4">
                              <Link
                                href={`/vendor-profile/${v.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                View Profile
                              </Link>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {vendors.length === 1 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-purple-700 text-sm text-center">
                  Add at least one more vendor to see the comparison table
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function CompareRow({ label, vendors, render }) {
  return (
    <tr>
      <td className="text-sm text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{label}</td>
      {vendors.map((v) => (
        <td key={v.id} className="text-sm text-gray-900 px-5 py-3">
          {render(v)}
        </td>
      ))}
    </tr>
  );
}
