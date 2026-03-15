'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Search, Calendar, PartyPopper, BadgeCheck } from 'lucide-react';

const CATEGORY_ICONS = {
  'Photography': '📸',
  'Videography': '🎬',
  'Catering': '🍽️',
  'Florist': '💐',
  'DJ': '🎧',
  'Live Band/Music': '🎵',
  'Venue': '🏛️',
  'Decorator/Stylist': '✨',
  'Cake': '🎂',
  'Wedding Planner': '💍',
  'Hair & Makeup': '💄',
  'Transport': '🚗',
  'Stationery': '✉️',
  'Entertainment': '🎪',
  'Other': '🎉',
};

const CATEGORY_SLUG_MAP = {
  'Photography': 'photographers',
  'Videography': 'videographers',
  'Catering': 'caterers',
  'Florist': 'florists',
  'DJ': 'djs',
  'Live Band/Music': 'live-bands',
  'Venue': 'venues',
  'Decorator/Stylist': 'decorators',
  'Cake': 'cake-makers',
  'Wedding Planner': 'wedding-planners',
  'Hair & Makeup': 'hair-and-makeup',
  'Transport': 'transport',
  'Stationery': 'stationery',
  'Entertainment': 'entertainment',
  'Other': 'other',
};

function VendorCard({ vendor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center relative">
        {vendor.image ? (
          <Image src={vendor.image} alt={vendor.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw" />
        ) : (
          <span className="text-5xl">🏪</span>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          {vendor.category}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2 text-lg flex items-center gap-1.5">
          {vendor.name}
          {vendor.verified && <BadgeCheck className="text-blue-500 flex-shrink-0" size={18} title="Verified vendor" />}
        </h3>
        {vendor.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {vendor.location}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          {vendor.rating ? (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-gray-400">({vendor.reviews})</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">New vendor</span>
          )}
          {vendor.startingPrice && (
            <span className="text-sm font-medium text-gray-700">From {vendor.startingPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vendorsRes, catsRes] = await Promise.all([
          fetch('/api/vendors'),
          fetch('/api/vendors/categories'),
        ]);
        const vendorsData = await vendorsRes.json();
        const catsData = await catsRes.json();
        if (vendorsRes.ok) {
          // Score and rank vendors — best profiles first
          const scored = vendorsData.vendors.map(v => {
            let s = 0;
            if (v.image) s += 20;
            if (v.startingPrice) s += 15;
            if (v.location) s += 10;
            if (v.rating !== null) s += 15 + Math.min(v.rating * 4, 20);
            if (v.reviews > 0) s += Math.min(v.reviews * 2, 20);
            return { ...v, _score: s };
          });
          scored.sort((a, b) => b._score - a._score);
          setFeaturedVendors(scored.slice(0, 4));
        }
        if (catsData.categories?.length > 0) {
          setActiveCategories(catsData.categories);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Event Nest" width={56} height={56} className="rounded-xl object-cover" />
            <span className="font-bold text-xl text-gray-900">Event Nest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Find the Perfect Vendors<br />for Your Event
          </h1>
          <p className="mt-6 text-base sm:text-xl text-purple-100 max-w-2xl mx-auto">
            Browse top-rated caterers, photographers, DJs, florists and more — all in one place.
            Plan your dream event with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors text-center"
            >
              Browse Vendors
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors text-center"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">How It Works</h2>
          <p className="text-center text-gray-500 mt-2 mb-12">Book your perfect vendor in three simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Search size={32} />, title: 'Discover', desc: 'Browse vendors by category, location and ratings to find your perfect match.' },
              { icon: <Calendar size={32} />, title: 'Book', desc: 'Choose a package, pick your date, and send a booking request directly.' },
              { icon: <PartyPopper size={32} />, title: 'Celebrate', desc: 'Coordinate with your vendor via messaging and enjoy your event.' },
            ].map((step, i) => (
              <div key={i} className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-lg mt-5 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">Featured Vendors</h2>
          <p className="text-center text-gray-500 mt-2 mb-12">Top-rated professionals ready to make your event unforgettable</p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : featuredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredVendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendor-profile/${vendor.id}`}>
                  <VendorCard vendor={vendor} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No vendors available yet. Check back soon!</p>
          )}
          <div className="text-center mt-10">
            <Link
              href="/marketplace"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              View All Vendors
            </Link>
          </div>
        </div>
      </section>

      {/* Category Browse */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">Browse by Category</h2>
          <p className="text-center text-gray-500 mt-2 mb-12">Find exactly what you need for your event</p>
          {activeCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {activeCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/vendors/${CATEGORY_SLUG_MAP[cat.name] || 'other'}`}
                  className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all"
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '🎉'}</span>
                  <p className="mt-2 font-medium text-gray-700 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.count} vendor{cat.count !== 1 ? 's' : ''}</p>
                </Link>
              ))}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to Plan Your Event?</h2>
          <p className="mt-4 text-purple-100 text-lg">
            Join thousands of happy customers who found their perfect vendors on Event Nest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Event Nest. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/help" className="text-sm hover:text-white transition-colors">Help & FAQ</Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
