'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Star, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import CustomerHeader from './CustomerHeader';

function parsePrice(str) {
  if (!str) return null;
  return Number(str.replace(/[£,]/g, ''));
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function RangeSlider({ min, max, step, minVal, maxVal, onMinChange, onMaxChange }) {
  const pct = (v) => max === min ? 0 : ((v - min) / (max - min)) * 100;
  return (
    <div className="range-slider relative h-5 w-full">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-purple-600 rounded-full"
        style={{ left: `${pct(minVal)}%`, width: `${pct(maxVal) - pct(minVal)}%` }}
      />
      <input
        type="range" min={min} max={max} step={step} value={minVal}
        onChange={e => onMinChange(Math.min(Number(e.target.value), maxVal - step))}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: minVal >= maxVal - step ? 5 : 3 }}
      />
      <input
        type="range" min={min} max={max} step={step} value={maxVal}
        onChange={e => onMaxChange(Math.max(Number(e.target.value), minVal + step))}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}

export default function CustomerMarketplace() {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location state
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, city }

  // Sort & filter state
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minPriceFilter, setMinPriceFilter] = useState(null); // null = unset
  const [maxPriceFilter, setMaxPriceFilter] = useState(null); // null = unset

  // Derive price range from current vendor set (vendors with a starting price)
  const vendorPrices = vendors.map(v => parsePrice(v.startingPrice)).filter(p => p !== null);
  const priceRangeMin = vendorPrices.length > 0 ? Math.min(...vendorPrices) : 0;
  const priceRangeMax = vendorPrices.length > 0 ? Math.max(...vendorPrices) : 1000;
  const priceStep = (priceRangeMax - priceRangeMin) <= 1000 ? 50 : (priceRangeMax - priceRangeMin) <= 5000 ? 100 : 500;
  // Effective slider values — default to range bounds when unset
  const sliderMin = minPriceFilter ?? priceRangeMin;
  const sliderMax = maxPriceFilter ?? priceRangeMax;

  // Reset price slider whenever the vendor list changes (e.g. category switch)
  useEffect(() => {
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
  }, [vendors]);

  const categories = [
    'All Categories',
    'Catering',
    'Photography',
    'Videography',
    'Florist',
    'DJ',
    'Live Band/Music',
    'Venue',
    'Decorator/Stylist',
    'Cake'
  ];

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      try {
        const params = selectedCategory !== 'All Categories'
          ? `?category=${encodeURIComponent(selectedCategory)}`
          : '';
        const res = await fetch(`/api/vendors${params}`);
        const data = await res.json();
        if (res.ok) setVendors(data.vendors);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, [selectedCategory]);

  // Load persisted wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        if (res.ok) setWishlist(data.vendorIds);
      } catch {}
    }
    fetchWishlist();
  }, []);

  // Geolocation detection — silent on mount, stored in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try { setUserLocation(JSON.parse(saved)); return; } catch {}
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let city = null;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'EventNest/1.0' } }
          );
          const d = await r.json();
          city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || null;
        } catch {}
        const loc = { lat, lng, city };
        setUserLocation(loc);
        localStorage.setItem('userLocation', JSON.stringify(loc));
      },
      () => {} // permission denied — silent
    );
  }, []);

  const clearLocation = () => {
    setUserLocation(null);
    localStorage.removeItem('userLocation');
    if (sortBy === 'nearest') setSortBy('rating');
  };

  const toggleWishlist = async (vendorId) => {
    const isWishlisted = wishlist.includes(vendorId);
    setWishlist(prev => isWishlisted ? prev.filter(id => id !== vendorId) : [...prev, vendorId]);
    try {
      await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
    } catch {
      setWishlist(prev => isWishlisted ? [...prev, vendorId] : prev.filter(id => id !== vendorId));
    }
  };

  const clearFilters = () => {
    setMinRating(0);
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
  };

  const isPriceFiltered = sliderMin > priceRangeMin || sliderMax < priceRangeMax;
  const activeFilterCount = (minRating > 0 ? 1 : 0) + (isPriceFiltered ? 1 : 0);

  const filteredVendors = vendors
    .filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = minRating === 0 || (vendor.rating !== null && vendor.rating >= minRating);
      const price = parsePrice(vendor.startingPrice);
      const matchesPrice = !isPriceFiltered || price === null || (price >= sliderMin && price <= sliderMax);
      return matchesSearch && matchesRating && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating ?? -1) - (a.rating ?? -1);
      }
      if (sortBy === 'price_asc') {
        const pa = parsePrice(a.startingPrice) ?? Infinity;
        const pb = parsePrice(b.startingPrice) ?? Infinity;
        return pa - pb;
      }
      if (sortBy === 'price_desc') {
        const pa = parsePrice(a.startingPrice) ?? -1;
        const pb = parsePrice(b.startingPrice) ?? -1;
        return pb - pa;
      }
      if (sortBy === 'reviews') {
        return (b.reviews ?? 0) - (a.reviews ?? 0);
      }
      if (sortBy === 'nearest' && userLocation) {
        const distA = (a.lat && a.lng) ? haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) : Infinity;
        const distB = (b.lat && b.lng) ? haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng) : Infinity;
        return distA - distB;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Find the perfect vendors for your event
          </h1>
          <p className="text-base sm:text-xl text-purple-100 mb-8">
            Discover trusted professionals to make your special day unforgettable
          </p>

          <div className="bg-white rounded-2xl p-4 max-w-4xl mx-auto shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 border border-gray-200 sm:border-0 rounded-xl sm:rounded-none py-1 sm:py-0">
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 outline-none text-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-3 border border-gray-200 sm:border-l sm:border-t-0 sm:border-b-0 sm:border-r-0 rounded-xl sm:rounded-none outline-none text-gray-700 cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(prev => !prev)}
                  className={`relative p-3 rounded-lg transition-colors flex-shrink-0 ${showFilters ? 'bg-purple-600 text-white' : 'hover:bg-gray-50 text-gray-600 border border-gray-200 sm:border-0'}`}
                >
                  <SlidersHorizontal size={20} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-gray-100 mt-4 pt-4 px-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10">
                  {/* Min Rating */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Minimum Rating</p>
                    <div className="flex gap-2">
                      {[0, 3, 4, 4.5].map(r => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            minRating === r
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-200 text-gray-700 hover:border-purple-400'
                          }`}
                        >
                          {r === 0 ? 'Any' : `${r}★+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Price Range:{' '}
                      <span className="text-purple-600">
                        {!isPriceFiltered
                          ? 'Any'
                          : `£${sliderMin.toLocaleString()} – £${sliderMax.toLocaleString()}`}
                      </span>
                    </p>
                    {vendorPrices.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-1">No pricing data for this category</p>
                    ) : priceRangeMin === priceRangeMax ? (
                      <p className="text-xs text-gray-500 mt-1">All vendors start at <span className="font-medium">£{priceRangeMin.toLocaleString()}</span></p>
                    ) : (
                      <>
                        <RangeSlider
                          min={priceRangeMin}
                          max={priceRangeMax}
                          step={priceStep}
                          minVal={sliderMin}
                          maxVal={sliderMax}
                          onMinChange={setMinPriceFilter}
                          onMaxChange={setMaxPriceFilter}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>£{priceRangeMin.toLocaleString()}</span>
                          <span>£{priceRangeMax.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Clear */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 mt-6 whitespace-nowrap"
                    >
                      <X size={14} />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredVendors.length}</span> vendors found
            </p>
            {userLocation?.city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200">
                <MapPin size={12} />
                Near {userLocation.city}
                <button onClick={clearLocation} className="ml-1 hover:text-purple-900" title="Clear location">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="reviews">Most Reviews</option>
            <option value="nearest">Nearest First</option>
          </select>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendor Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-64">
                  {vendor.image ? (
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                      <span className="text-6xl font-bold text-purple-300">{vendor.name?.[0] || 'V'}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(vendor.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={20}
                      className={wishlist.includes(vendor.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-purple-600 font-medium">{vendor.category}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{vendor.description}</p>

                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="font-semibold text-gray-900">{vendor.rating ?? '—'}</span>
                      <span className="text-gray-500 text-sm">({vendor.reviews})</span>
                    </div>
                    {vendor.location && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin size={14} />
                        {vendor.location}
                      </div>
                    )}
                    {userLocation && vendor.lat && vendor.lng && (
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                        ~{Math.round(haversineKm(userLocation.lat, userLocation.lng, vendor.lat, vendor.lng))} km away
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {vendor.startingPrice && (
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="font-bold text-gray-900">{vendor.startingPrice}</p>
                      </div>
                    )}
                    <Link href={`/vendor-profile/${vendor.id}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredVendors.length === 0 && (
          <div className="text-center py-20">
            <Search className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No vendors found matching your criteria</p>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
