'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Users, Store, CreditCard, MessageSquare, Shield, HelpCircle } from 'lucide-react';
import PublicHeader from './PublicHeader';

const FAQ_SECTIONS = [
  {
    title: 'For Customers',
    icon: Users,
    questions: [
      {
        q: 'How do I find vendors for my event?',
        a: 'Head to the Discover page (marketplace) where you can browse all approved vendors. Use the search bar, category filters, and location sorting to find the perfect match. You can also use the AI Event Planner to get personalised recommendations based on your event description.',
      },
      {
        q: 'How do I book a vendor?',
        a: 'Visit a vendor\'s profile and click "Book Now" or "Request Custom Quote". For standard packages, select your preferred option and submit a booking request. For custom events, start a conversation with the vendor to discuss your needs and receive a tailored quote.',
      },
      {
        q: 'What is the wishlist for?',
        a: 'The wishlist lets you save vendors you\'re interested in so you can easily find them later. You can also create groups (e.g. "Wedding Photographers", "Caterers") to organise your shortlist. Use the Compare feature to view vendors side by side.',
      },
      {
        q: 'How does the AI Event Planner work?',
        a: 'Describe your event in plain English — for example, "Birthday party for 30 guests, £500 budget, outdoor theme". Our AI will generate a detailed plan with budget breakdown by category, matched real vendors from our marketplace, and practical planning tips.',
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Yes, you can cancel a booking from your My Bookings page. Note that cancellation policies vary by vendor — check the vendor\'s profile for their specific policy before booking.',
      },
      {
        q: 'How do I leave a review?',
        a: 'After your event is completed, you\'ll be able to leave a review on the vendor\'s profile. Honest reviews help other customers make informed decisions and help vendors improve their services.',
      },
    ],
  },
  {
    title: 'For Vendors',
    icon: Store,
    questions: [
      {
        q: 'How do I create my vendor profile?',
        a: 'Register as a vendor, then go to your Profile Editor. Fill in your business name, category, description, pricing, and upload photos. The more complete your profile, the more likely customers will book you. Your profile needs to be approved by our team before it goes live.',
      },
      {
        q: 'How do I manage bookings?',
        a: 'All booking requests appear in your Messages inbox. You can accept, decline, or propose alternative dates. Confirmed bookings show up in your Calendar view so you can manage your schedule.',
      },
      {
        q: 'How do custom quotes work?',
        a: 'When a customer requests a custom quote, you\'ll receive a message in your inbox. Open the conversation, click "Send Quote", and fill in the title, price, date, and features. The customer can then accept or decline your quote.',
      },
      {
        q: 'What does the QR code feature do?',
        a: 'The QR Code page generates a branded, scannable QR code that links directly to your public profile. Download it as a PNG for business cards, flyers, or print it for your shop window — great for offline marketing.',
      },
      {
        q: 'How do I track my performance?',
        a: 'The Analytics dashboard shows your profile views, inquiries, bookings, and revenue over time. You can see your conversion funnel, busiest days, and performance score to understand how well your profile is performing.',
      },
      {
        q: 'Can I add packages to my profile?',
        a: 'Yes! In the Profile Editor, scroll down to the Packages section. You can create multiple packages with different names, prices, and features. Customers can select a package when booking, or request a custom quote.',
      },
    ],
  },
  {
    title: 'Payments & Pricing',
    icon: CreditCard,
    questions: [
      {
        q: 'Is Event Nest free to use?',
        a: 'Event Nest is free for customers to browse and contact vendors. Vendor accounts are also free to create and maintain. We may introduce optional premium features for vendors in the future.',
      },
      {
        q: 'How are payments handled?',
        a: 'Payment arrangements are made directly between you and the vendor. Event Nest facilitates the connection and communication, but does not process payments at this time.',
      },
      {
        q: 'What do the prices on vendor profiles mean?',
        a: 'Vendors can display pricing as per day, per head (per guest), or both. The "Starting from" price shown in search results is the lowest available price from their packages or base rates. Contact the vendor for an exact quote for your event.',
      },
    ],
  },
  {
    title: 'Messages & Communication',
    icon: MessageSquare,
    questions: [
      {
        q: 'How do I message a vendor?',
        a: 'You can start a conversation with a vendor by clicking "Message" or "Request Custom Quote" on their profile page. All conversations are managed through the Messages section in your dashboard.',
      },
      {
        q: 'Can I send images and files?',
        a: 'Yes! You can attach images and PDF files to your messages. This is great for sharing inspiration photos, floor plans, or event briefs with vendors.',
      },
      {
        q: 'Will I get notifications?',
        a: 'Yes, you\'ll receive in-app notifications for new messages, booking updates, and quote responses. Check the bell icon in the top navigation bar. Email notifications are also sent for important updates.',
      },
    ],
  },
  {
    title: 'Account & Privacy',
    icon: Shield,
    questions: [
      {
        q: 'How do I change my account settings?',
        a: 'Go to Settings from the navigation menu. You can update your profile information, notification preferences, and account details.',
      },
      {
        q: 'Is my data safe?',
        a: 'We take data protection seriously. Your personal information is stored securely and is never shared with third parties without your consent. See our Privacy Policy for full details.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Please contact us at hello@eventnestgroup.com to request account deletion. We\'ll process your request and remove all your personal data.',
      },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  function toggle(sectionIdx, questionIdx) {
    const key = `${sectionIdx}-${questionIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const filteredSections = FAQ_SECTIONS.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (faq) =>
        !search.trim() ||
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((section) => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Help & FAQ</h1>
          <p className="text-gray-500 text-lg mb-6">Find answers to common questions about Event Nest</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* FAQ sections */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {filteredSections.map((section, sIdx) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Icon size={20} className="text-purple-600" />
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {section.questions.map((faq, qIdx) => {
                  const isOpen = openItems[`${sIdx}-${qIdx}`];
                  return (
                    <div key={qIdx}>
                      <button
                        onClick={() => toggle(sIdx, qIdx)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-purple-900 mb-2">Still need help?</h3>
          <p className="text-sm text-purple-700 mb-4">
            Can&apos;t find what you&apos;re looking for? Get in touch and we&apos;ll be happy to help.
          </p>
          <a
            href="mailto:hello@eventnestgroup.com"
            className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
