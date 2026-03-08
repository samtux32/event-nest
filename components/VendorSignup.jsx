'use client';

import Link from 'next/link';
import { Search, MessageSquare, Star, CalendarCheck, ArrowRight, UserPlus, CheckCircle, Briefcase } from 'lucide-react';
import PublicHeader from './PublicHeader';

const benefits = [
  { icon: Search, title: 'Get Discovered', desc: 'Customers searching for your services will find your profile in our marketplace.' },
  { icon: MessageSquare, title: 'Receive Enquiries', desc: 'Get booking requests and messages directly from interested customers.' },
  { icon: Star, title: 'Showcase Your Work', desc: 'Build your portfolio with photos, reviews, and detailed service packages.' },
  { icon: CalendarCheck, title: 'Manage Everything', desc: 'Calendar, quotes, messages, and bookings — all in one place.' },
];

const steps = [
  { num: '1', icon: UserPlus, title: 'Create Your Profile', desc: 'Sign up free and fill in your business details, services, and pricing.' },
  { num: '2', icon: CheckCircle, title: 'Get Approved', desc: 'Our team reviews your profile to ensure quality for customers.' },
  { num: '3', icon: Briefcase, title: 'Start Getting Bookings', desc: 'Appear in search results and receive booking requests from customers.' },
];

export default function VendorSignup() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Grow Your Events Business
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto">
            List your services on Event Nest for free and connect with customers looking for exactly what you offer.
          </p>
          <Link
            href="/register?role=vendor"
            className="mt-8 inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">Why Join Event Nest?</h2>
          <p className="text-center text-gray-500 mt-2 mb-12">Everything you need to grow your events business</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{b.title}</h3>
                  <p className="text-gray-500 mt-1">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">How It Works</h2>
          <p className="text-center text-gray-500 mt-2 mb-12">Three simple steps to start receiving bookings</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="text-center bg-gray-50 rounded-2xl p-8">
                  <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    {s.num}
                  </div>
                  <h3 className="font-semibold text-lg mt-5 text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 mt-2">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Join Event Nest Today — It's Free</h2>
          <p className="mt-4 text-purple-100 text-lg">
            No fees, no hidden costs. Create your profile and start growing your business.
          </p>
          <Link
            href="/register?role=vendor"
            className="mt-8 inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Create Your Free Profile <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Event Nest. All rights reserved.</p>
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
