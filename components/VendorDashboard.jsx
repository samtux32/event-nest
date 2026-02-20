'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';

import VendorHeader from '@/components/VendorHeader';
import { useAuth } from '@/components/AuthProvider';
import {
  MessageSquare,
  CalendarDays,
  Clock,
  DollarSign,
  CheckCircle,
  Loader2
} from 'lucide-react';

function formatPrice(val) {
  const num = Number(val);
  return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusColors = {
  new_inquiry: 'bg-purple-100 text-purple-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  new_inquiry: 'New',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function VendorDashboard() {
  const { profile: authProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (res.ok) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const newInquiries = bookings.filter(b => b.status === 'new_inquiry').length;
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedEvents = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

  // Show new_inquiry and pending bookings in the inquiries list
  const activeInquiries = bookings.filter(b => b.status === 'new_inquiry' || b.status === 'pending');

  const acceptBooking = async (booking) => {
    setUpdatingId(booking.id);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: 'confirmed' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: 'confirmed', confirmedAt: new Date().toISOString() } : b
        ));
        if (selectedInquiry?.id === booking.id) setSelectedInquiry(null);
      }
    } catch (err) {
      console.error('Failed to accept booking:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteProfile = () => {};

  return (
    <div className="min-h-screen bg-gray-50">
    <VendorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {authProfile?.businessName || 'Vendor'} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your business</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">New Inquiries</p>
                <p className="text-5xl font-bold">{newInquiries}</p>
                <p className="text-gray-500 text-sm mt-2">Awaiting response</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Upcoming Bookings</p>
                <p className="text-5xl font-bold">{upcomingBookings}</p>
                <p className="text-gray-500 text-sm mt-2">Events scheduled</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-5xl font-bold">{formatPrice(totalRevenue)}</p>
                <p className="text-gray-500 text-sm mt-2">All time earnings</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-2">Completed Events</p>
                <p className="text-5xl font-bold">{completedEvents}</p>
                <p className="text-gray-500 text-sm mt-2">Successfully delivered</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Inquiries</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-purple-600 animate-spin" size={32} />
                <p className="text-gray-500">Loading inquiries...</p>
              </div>
            ) : activeInquiries.length > 0 ? (
              activeInquiries.map((iq) => (
                <div
                  key={iq.id}
                  onClick={() => setSelectedInquiry(iq)}
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                    selectedInquiry?.id === iq.id
                      ? 'border-purple-600 bg-purple-50 shadow-sm'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {(iq.contactName || iq.customer?.fullName || '?')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{iq.contactName || iq.customer?.fullName || 'Customer'}</p>
                      <p className="text-sm text-gray-500">{formatDate(iq.eventDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{iq.totalPrice ? formatPrice(iq.totalPrice) : '—'}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[iq.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[iq.status] || iq.status}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptBooking(iq);
                      }}
                      disabled={updatingId === iq.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                    >
                      {updatingId === iq.id && <Loader2 size={14} className="animate-spin" />}
                      Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
                <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
                <p>No active inquiries</p>
              </div>
            )}
          </div>
        </div>
        {/* Slide-out Detail Panel */}
        {selectedInquiry && (
          <div className="mt-8 p-6 bg-white border-2 border-purple-600 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Inquiry Details</h3>
                <h2 className="text-2xl font-bold text-gray-900">{selectedInquiry.contactName || selectedInquiry.customer?.fullName || 'Customer'}</h2>
                <p className="text-gray-500 font-medium">
                  {formatDate(selectedInquiry.eventDate)}
                  {selectedInquiry.totalPrice ? ` • ${formatPrice(selectedInquiry.totalPrice)}` : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {selectedInquiry.eventType && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Event Type</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.eventType}</p>
                </div>
              )}
              {selectedInquiry.guestCount && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Guest Count</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.guestCount}</p>
                </div>
              )}
              {selectedInquiry.venueName && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Venue</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.venueName}</p>
                </div>
              )}
              {selectedInquiry.package && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Package</p>
                  <p className="font-medium text-gray-900">{selectedInquiry.package.name}</p>
                </div>
              )}
            </div>

            {selectedInquiry.specialRequests && (
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                <p className="text-xs text-gray-500 mb-2">Special Requests</p>
                <p className="text-gray-700 leading-relaxed italic">
                  "{selectedInquiry.specialRequests}"
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href={selectedInquiry.conversation?.id ? `/messages?conv=${selectedInquiry.conversation.id}` : '/messages'}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors text-center"
              >
                Send Message
              </Link>
              <button
                onClick={() => acceptBooking(selectedInquiry)}
                disabled={updatingId === selectedInquiry.id}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingId === selectedInquiry.id && <Loader2 size={16} className="animate-spin" />}
                Accept Booking
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
