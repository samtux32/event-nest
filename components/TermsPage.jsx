'use client';

import React from 'react';
import Link from 'next/link';
import PublicHeader from './PublicHeader';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Event Nest ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.`,
  },
  {
    title: '2. Description of Service',
    content: `Event Nest is an online marketplace that connects event service vendors ("Vendors") with customers seeking event services ("Customers"). The Platform facilitates discovery, communication, and booking between Vendors and Customers. Event Nest does not provide event services directly.`,
  },
  {
    title: '3. User Accounts',
    content: `To use certain features of the Platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account and keep this information up to date. You must be at least 18 years old to create an account.`,
  },
  {
    title: '4. Vendor Responsibilities',
    content: `Vendors are responsible for the accuracy of their profile information, including business name, category, pricing, portfolio images, and availability. Vendors must provide services as described and agreed upon with Customers. All vendor profiles are subject to approval by Event Nest before being made visible to Customers. Event Nest reserves the right to remove or suspend vendor profiles that violate these terms or our community standards.`,
  },
  {
    title: '5. Customer Responsibilities',
    content: `Customers are responsible for providing accurate event details when making booking requests. Customers should review vendor profiles, packages, and cancellation policies before confirming bookings. Communication with vendors should be respectful and professional.`,
  },
  {
    title: '6. Bookings and Payments',
    content: `Event Nest facilitates the connection between Vendors and Customers but is not a party to any booking agreement between them. Payment terms, methods, and arrangements are agreed upon directly between the Vendor and Customer. Event Nest is not responsible for payment disputes between Vendors and Customers.`,
  },
  {
    title: '7. Reviews and Content',
    content: `Users may submit reviews, messages, and other content ("User Content") through the Platform. By submitting User Content, you grant Event Nest a non-exclusive, worldwide, royalty-free licence to use, display, and distribute such content on the Platform. Reviews must be honest, fair, and based on genuine experiences. We reserve the right to remove User Content that violates these terms.`,
  },
  {
    title: '8. Prohibited Conduct',
    content: `You agree not to: use the Platform for any unlawful purpose; submit false or misleading information; harass, abuse, or harm other users; attempt to gain unauthorised access to the Platform or other accounts; use automated systems to scrape or collect data from the Platform; impersonate any person or entity; or interfere with the proper functioning of the Platform.`,
  },
  {
    title: '9. Intellectual Property',
    content: `The Platform, including its design, logos, text, and software, is owned by Event Nest and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Platform without our prior written consent. Vendors retain ownership of their uploaded content but grant Event Nest a licence to display it on the Platform.`,
  },
  {
    title: '10. Limitation of Liability',
    content: `Event Nest is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of the Platform, including but not limited to disputes between Vendors and Customers, service quality issues, or data loss. Our total liability shall not exceed the amount you have paid to Event Nest, if any, in the twelve months preceding the claim.`,
  },
  {
    title: '11. Termination',
    content: `We may suspend or terminate your account at our discretion if you violate these terms. You may close your account at any time by contacting us. Upon termination, your right to use the Platform ceases immediately, though certain provisions of these terms will survive.`,
  },
  {
    title: '12. Governing Law',
    content: `These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '13. Contact',
    content: `If you have questions about these Terms of Service, please contact us at hello@eventnestgroup.com.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500">Last updated: February 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {SECTIONS.map((section) => (
            <div key={section.title} className="px-6 py-5">
              <h2 className="font-semibold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/privacy" className="text-sm text-purple-600 hover:text-purple-700">
            View our Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
