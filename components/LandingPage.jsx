'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Search, Calendar, PartyPopper } from 'lucide-react';

const categories = [
  { name: 'Catering', icon: '🍽️' },
  { name: 'Photography', icon: '📸' },
  { name: 'Videography', icon: '🎬' },
  { name: 'Florist', icon: '💐' },
  { name: 'DJ', icon: '🎧' },
  { name: 'Live Band/Music', icon: '🎵' },
  { name: 'Venue', icon: '🏛️' },
  { name: 'Decorator/Stylist', icon: '✨' },
  { name: 'Cake', icon: '🎂' },
];

function VendorCard({ vendor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
        {vendor.image ? (
          <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏪</span>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          {vendor.category}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2 text-lg">{vendor.name}</h3>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/vendors');
        const data = await res.json();
        if (res.ok) {
          setFeaturedVendors(data.vendors.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch featured vendors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-14 h-14 rounded-xl object-cover" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/marketplace"
                className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <p className="mt-2 font-medium text-gray-700 text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
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
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          &copy; {new Date().getFullYear()} Event Nest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
