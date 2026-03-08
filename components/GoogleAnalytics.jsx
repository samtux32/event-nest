'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (localStorage.getItem('eventNest_cookieConsent') === 'accepted') {
      setConsented(true);
    }
    function onAccept() { setConsented(true); }
    window.addEventListener('cookieConsentAccepted', onAccept);
    return () => window.removeEventListener('cookieConsentAccepted', onAccept);
  }, []);

  if (!consented || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
