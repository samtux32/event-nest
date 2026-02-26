'use client';

import React from 'react';
import Link from 'next/link';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you create an account, including your name, email address, and role (customer or vendor). Vendors additionally provide business information such as business name, category, location, pricing, and portfolio images. We also collect information automatically through your use of the Platform, including pages visited, search queries, and device information.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to: provide and maintain the Platform; connect Customers with Vendors; send notifications about bookings, messages, and account activity; improve and personalise your experience; analyse usage patterns to improve the Platform; and communicate important updates about our services.`,
  },
  {
    title: '3. Information Sharing',
    content: `We share your information in the following ways: Vendor profiles (business name, category, location, pricing, portfolio) are publicly visible on the Platform. Customer names are shared with Vendors when booking requests or messages are sent. We do not sell your personal information to third parties. We may share information with service providers who help us operate the Platform (e.g., hosting, email delivery).`,
  },
  {
    title: '4. Data Storage and Security',
    content: `Your data is stored securely using industry-standard encryption and security measures. We use Supabase for authentication and database services, which provides enterprise-grade security. While we take reasonable measures to protect your information, no method of transmission over the Internet is 100% secure.`,
  },
  {
    title: '5. Cookies and Local Storage',
    content: `We use cookies and browser local storage to maintain your login session, remember your preferences (such as location settings and recently viewed vendors), and improve your experience. You can control cookie settings through your browser, though disabling cookies may affect Platform functionality.`,
  },
  {
    title: '6. Email Communications',
    content: `We send transactional emails for booking confirmations, new messages, quote updates, and other important account activity. These emails are essential to the service and cannot be opted out of while maintaining an active account. We use Resend as our email delivery provider.`,
  },
  {
    title: '7. Your Rights',
    content: `Under UK data protection law (UK GDPR), you have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to processing of your data; request restriction of processing; and data portability. To exercise any of these rights, contact us at hello@eventnestgroup.com.`,
  },
  {
    title: '8. Data Retention',
    content: `We retain your personal data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required to retain it for legal or legitimate business purposes. Anonymised, aggregated data may be retained for analytics purposes.`,
  },
  {
    title: '9. Third-Party Services',
    content: `The Platform integrates with the following third-party services: Supabase (authentication and database), Resend (email delivery), and Vercel (hosting). Each of these services has its own privacy policy governing how they handle data. We also use OpenStreetMap's Nominatim service for location geocoding.`,
  },
  {
    title: '10. Children\'s Privacy',
    content: `The Platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.`,
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Platform after any changes constitutes acceptance of the new policy.`,
  },
  {
    title: '12. Contact Us',
    content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us at hello@eventnestgroup.com.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
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
          <Link href="/terms" className="text-sm text-purple-600 hover:text-purple-700">
            View our Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
