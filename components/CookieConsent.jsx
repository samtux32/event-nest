'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('eventNest_cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  function handleChoice(choice) {
    localStorage.setItem('eventNest_cookieConsent', choice);
    setVisible(false);
    if (choice === 'accepted') {
      window.dispatchEvent(new Event('cookieConsentAccepted'));
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 sm:p-5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          We use cookies to improve your experience.{' '}
          <Link href="/privacy" className="text-purple-600 hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => handleChoice('declined')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
