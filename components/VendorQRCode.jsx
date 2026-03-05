'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Palette, ExternalLink, Loader2, Copy, Check, Users, Share2 } from 'lucide-react';
import AppHeader from './AppHeader';

const SCHEMES = {
  purple: { bg: '#7c3aed', fg: '#ffffff', label: 'Purple' },
  black:  { bg: '#111827', fg: '#ffffff', label: 'Black' },
  white:  { bg: '#ffffff', fg: '#111827', label: 'White' },
};

export default function VendorQRCode() {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState('purple');
  const [referralCode, setReferralCode] = useState(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, fullRes] = await Promise.all([
          fetch('/api/vendors/profile'),
          fetch('/api/auth/profile'),
        ]);
        const profileData = profileRes.ok ? await profileRes.json() : null;
        const fullData = fullRes.ok ? await fullRes.json() : null;
        if (profileData?.id) {
          const v = profileData.vendor || profileData;
          setVendorProfile({
            id: profileData.id,
            businessName: v.businessName || fullData?.profile?.businessName || 'My Business',
          });
          if (v.referralCode) setReferralCode(v.referralCode);
          if (v.referralCount !== undefined) setReferralCount(v.referralCount);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const profileUrl = vendorProfile
    ? `${window.location.origin}/vendor-profile/${vendorProfile.id}`
    : '';

  const colours = SCHEMES[scheme];

  function downloadPNG() {
    const sourceCanvas = qrRef.current?.querySelector('canvas');
    if (!sourceCanvas) return;

    const w = 600, h = 800, pad = 40;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = colours.bg;
    ctx.roundRect(0, 0, w, h, 24);
    ctx.fill();

    // Header
    ctx.fillStyle = colours.fg;
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Event Nest', w / 2, pad + 36);

    // QR code
    const qrSize = 360;
    const qrY = 100;
    // White background behind QR
    ctx.fillStyle = '#ffffff';
    ctx.roundRect((w - qrSize - 32) / 2, qrY - 16, qrSize + 32, qrSize + 32, 16);
    ctx.fill();
    ctx.drawImage(sourceCanvas, (w - qrSize) / 2, qrY, qrSize, qrSize);

    // Business name
    ctx.fillStyle = colours.fg;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const nameY = qrY + qrSize + 60;
    ctx.fillText(vendorProfile.businessName, w / 2, nameY);

    // URL
    ctx.font = '14px system-ui, sans-serif';
    ctx.globalAlpha = 0.7;
    const shortUrl = profileUrl.replace(/^https?:\/\//, '');
    ctx.fillText(shortUrl.length > 50 ? shortUrl.slice(0, 50) + '...' : shortUrl, w / 2, nameY + 32);
    ctx.globalAlpha = 1;

    // "Scan to view" text
    ctx.font = '16px system-ui, sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Scan to view our profile', w / 2, h - pad - 10);
    ctx.globalAlpha = 1;

    // Download
    const link = document.createElement('a');
    link.download = `${vendorProfile.businessName.replace(/\s+/g, '-')}-QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </>
    );
  }

  if (!vendorProfile) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Unable to load your vendor profile.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share & Promote</h1>
          <p className="text-gray-500 mb-8">Share your profile and grow your network on Event Nest.</p>

          {/* Referral Link Section */}
          {referralCode && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Share2 size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Referral Link</h2>
                  <p className="text-sm text-gray-500">Invite other vendors to join Event Nest</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 font-mono truncate">
                  {(process.env.NEXT_PUBLIC_APP_URL || window.location.origin)}/register?ref={referralCode}
                </div>
                <button
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/register?ref=${referralCode}`;
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-gray-400" />
                <span>
                  <span className="font-semibold text-gray-900">{referralCount}</span>{' '}
                  vendor{referralCount !== 1 ? 's' : ''} joined using your link
                </span>
              </div>
            </div>
          )}

          {/* QR Code Section */}
          <h2 className="text-lg font-bold text-gray-900 mb-1">QR Code</h2>
          <p className="text-sm text-gray-500 mb-6">Share your profile with a scannable QR code. Perfect for business cards, flyers, and shop windows.</p>

          {/* Colour scheme picker */}
          <div className="flex items-center gap-3 mb-6">
            <Palette size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">Colour:</span>
            {Object.entries(SCHEMES).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setScheme(key)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  scheme === key ? 'border-purple-500 scale-110 ring-2 ring-purple-200' : 'border-gray-300'
                }`}
                style={{ backgroundColor: s.bg }}
                title={s.label}
              />
            ))}
          </div>

          {/* QR Card preview */}
          <div
            ref={qrRef}
            className="rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-6 shadow-lg print:shadow-none mx-auto max-w-sm transition-colors"
            style={{ backgroundColor: colours.bg }}
          >
            <h2 className="text-xl font-bold" style={{ color: colours.fg }}>
              Event Nest
            </h2>

            <div className="bg-white rounded-xl p-4">
              <QRCodeCanvas
                value={profileUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-center">
              <p className="font-semibold text-lg" style={{ color: colours.fg }}>
                {vendorProfile.businessName}
              </p>
              <p className="text-sm mt-1 opacity-70" style={{ color: colours.fg }}>
                Scan to view our profile
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={downloadPNG}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              <Download size={16} />
              Download PNG
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm w-full sm:w-auto justify-center print:hidden"
            >
              <Printer size={16} />
              Print
            </button>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
            >
              <ExternalLink size={16} />
              View Profile
            </a>
          </div>

          {/* Tips */}
          <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Tips for using your QR code</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                Add it to your business cards so potential clients can instantly view your portfolio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                Print it on flyers or brochures for wedding fairs and event expos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                Display it in your shop window or at your stand for walk-in customers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                Include it in email signatures for a professional touch
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          header, .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
