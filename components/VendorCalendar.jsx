'use client';

import React, { useState, useEffect } from 'react';
import VendorHeader from '@/components/VendorHeader';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  Loader2
} from 'lucide-react';

const DB_STATUS_MAP = {
  new_inquiry: 'Pending',
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusColors = {
  Confirmed: 'bg-green-500',
  Pending: 'bg-yellow-500',
  Completed: 'bg-blue-500',
  Cancelled: 'bg-gray-400',
};

function formatPrice(val) {
  if (!val) return '—';
  return `£${Number(val).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function mapBooking(b) {
  const location = [b.venueName, b.venueAddress].filter(Boolean).join(', ') || '—';
  return {
    id: b.id,
    date: b.eventDate ? new Date(b.eventDate) : null,
    clientName: b.contactName || b.customer?.fullName || 'Customer',
    eventType: b.eventType || 'Event',
    time: b.startTime || '—',
    location,
    price: formatPrice(b.totalPrice),
    status: DB_STATUS_MAP[b.status] || 'Pending',
    email: b.contactEmail || '—',
    phone: b.contactPhone || '—',
    notes: b.specialRequests || '—',
  };
}

export default function VendorCalendar() {
  const [deepLinkBookingId, setDeepLinkBookingId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('bookingId');
    if (id) setDeepLinkBookingId(id);
  }, []);

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth());
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.json())
      .then(data => {
        if (data.bookings) {
          const mapped = data.bookings
            .filter(b => b.status !== 'cancelled')
            .map(mapBooking);
          setBookings(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch bookings:', err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-open booking popup when navigated from messages with a bookingId
  useEffect(() => {
    if (!deepLinkBookingId || bookings.length === 0) return;
    const target = bookings.find(b => b.id === deepLinkBookingId);
    if (target) {
      setSelectedBooking(target);
      if (target.date) {
        setCurrentDate(new Date(target.date.getFullYear(), target.date.getMonth()));
      }
    }
  }, [deepLinkBookingId, bookings]);

  // Calendar logic
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getBookingsForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bookings.filter(b => b.date && isSameDay(b.date, date));
  };

  const isToday = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isSameDay(date, new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const upcomingBookings = bookings
    .filter(b => b.date && b.date >= new Date() && b.status !== 'Cancelled')
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const unscheduledBookings = bookings.filter(b => !b.date);

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-600">Manage your upcoming events and bookings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Calendar — 2 columns */}
            <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (day === null) return <div key={index} className="aspect-square" />;
                  const dayBookings = getBookingsForDate(day);
                  const today = isToday(day);
                  return (
                    <div
                      key={index}
                      className={`aspect-square border rounded-lg p-2 transition-all ${
                        today ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                      } ${dayBookings.length > 0 ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${today ? 'text-purple-600' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map(booking => (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={`w-full text-left text-xs px-1.5 py-1 rounded ${statusColors[booking.status] || 'bg-gray-400'} text-white truncate hover:opacity-80 transition-opacity`}
                          >
                            {booking.clientName.split(' ')[0]}
                          </button>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings Sidebar — 1 column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4">Upcoming Bookings</h3>

                <div className="space-y-3">
                  {upcomingBookings.map(booking => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                        selectedBooking?.id === booking.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-900 truncate pr-2">{booking.clientName}</div>
                        <span className={`px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0 ${statusColors[booking.status] || 'bg-gray-400'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          {booking.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        {booking.time !== '—' && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {booking.time}
                          </div>
                        )}
                        {booking.price !== '—' && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} />
                            {booking.price}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {upcomingBookings.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <CalendarDays className="mx-auto mb-3" size={32} />
                      <p className="text-sm">No upcoming bookings</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Unscheduled bookings */}
              {unscheduledBookings.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-amber-200 bg-amber-50">
                  <h3 className="text-base font-bold text-amber-800 mb-1">No date set</h3>
                  <p className="text-xs text-amber-600 mb-4">These bookings aren't on the calendar yet — ask the customer to confirm a date.</p>
                  <div className="space-y-3">
                    {unscheduledBookings.map(booking => (
                      <div
                        key={booking.id}
                        className="p-3 bg-white rounded-xl border border-amber-200"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 text-sm">{booking.clientName}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full text-white ${statusColors[booking.status] || 'bg-gray-400'}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{booking.eventType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedBooking.clientName}</h2>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full text-white ${statusColors[selectedBooking.status] || 'bg-gray-400'}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                    <p className="text-gray-900 font-semibold">{selectedBooking.eventType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Price</label>
                    <p className="text-gray-900 font-semibold">{selectedBooking.price}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Date & Time</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <CalendarDays size={18} />
                    <span className="font-semibold">
                      {selectedBooking.date.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {selectedBooking.time !== '—' && ` at ${selectedBooking.time}`}
                    </span>
                  </div>
                </div>

                {selectedBooking.location !== '—' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Location</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin size={18} />
                      <span>{selectedBooking.location}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400 flex-shrink-0" />
                      {selectedBooking.email !== '—' ? (
                        <a href={`mailto:${selectedBooking.email}`} className="text-purple-600 hover:underline text-sm truncate">
                          {selectedBooking.email}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      {selectedBooking.phone !== '—' ? (
                        <a href={`tel:${selectedBooking.phone}`} className="text-purple-600 hover:underline text-sm">
                          {selectedBooking.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedBooking.notes !== '—' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Special Requests</label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full border-2 border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
