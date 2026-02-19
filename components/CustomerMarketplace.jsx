'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Star, MapPin, SlidersHorizontal } from 'lucide-react';
import { useAuth } from './AuthProvider';
import CustomerHeader from './CustomerHeader';

export default function CustomerMarketplace() {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const toggleWishlist = async (vendorId) => {
    const isWishlisted = wishlist.includes(vendorId);
    // Optimistic update
    setWishlist(prev => isWishlisted ? prev.filter(id => id !== vendorId) : [...prev, vendorId]);
    try {
      await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
    } catch {
      // Revert on failure
      setWishlist(prev => isWishlisted ? [...prev, vendorId] : prev.filter(id => id !== vendorId));
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Find the perfect vendors for your event
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Discover trusted professionals to make your special day unforgettable
          </p>

          <div className="bg-white rounded-2xl p-4 max-w-4xl mx-auto shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 outline-none text-gray-700"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 border-l border-gray-200 outline-none text-gray-700 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="p-3 hover:bg-gray-50 rounded-lg">
                <SlidersHorizontal className="text-gray-600" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredVendors.length}</span> vendors found
          </p>
          <select className="px-4 py-2 border border-gray-200 rounded-lg outline-none cursor-pointer">
            <option>Highest Rated</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Reviews</option>
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
          <div className="grid grid-cols-3 gap-6">
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
          <div className="grid grid-cols-3 gap-6">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-64">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="font-semibold text-gray-900">{vendor.rating}</span>
                      <span className="text-gray-500 text-sm">({vendor.reviews})</span>
                    </div>
                    {vendor.location && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin size={14} />
                        {vendor.location}
                      </div>
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
