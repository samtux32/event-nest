'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ChevronDown } from 'lucide-react';
import { generateICS } from '@/lib/ics';

function getEventData(booking, role) {
  const eventDate = booking.eventDate ? new Date(booking.eventDate) : new Date(booking.date);
  const eventType = booking.eventType || 'Event';
  const vendorName = booking.vendor?.businessName || 'Vendor';
  const customerName = booking.contactName || booking.customer?.fullName || booking.clientName || 'Customer';

  const title = role === 'vendor'
    ? `${eventType} - ${customerName}`
    : `${eventType} - ${vendorName}`;

  const descParts = [];
  if (eventType) descParts.push(`Event: ${eventType}`);
  if (booking.guestCount) descParts.push(`Guests: ${booking.guestCount}`);
  if (booking.package?.name) descParts.push(`Package: ${booking.package.name}`);
  if (booking.specialRequests) descParts.push(`Notes: ${booking.specialRequests}`);
  const description = descParts.join(' | ');

  const locationParts = [booking.venueName, booking.venueAddress].filter(Boolean);
  const location = locationParts.join(', ');

  return { eventDate, eventType, vendorName, customerName, title, description, location };
}

function padTwo(n) {
  return String(n).padStart(2, '0');
}

function buildGoogleCalendarUrl(booking, role) {
  const { eventDate, title, description, location } = getEventData(booking, role);
  const dateStr = `${eventDate.getFullYear()}${padTwo(eventDate.getMonth() + 1)}${padTwo(eventDate.getDate())}`;

  let dates;
  if (booking.startTime) {
    const [sh, sm] = booking.startTime.split(':').map(Number);
    const startStr = `${dateStr}T${padTwo(sh)}${padTwo(sm)}00`;
    let eh, em;
    if (booking.endTime) {
      [eh, em] = booking.endTime.split(':').map(Number);
    } else {
      eh = sh + 2;
      em = sm;
      if (eh >= 24) eh = 23;
    }
    const endStr = `${dateStr}T${padTwo(eh)}${padTwo(em)}00`;
    dates = `${startStr}/${endStr}`;
  } else {
    // All-day event
    const next = new Date(eventDate);
    next.setDate(next.getDate() + 1);
    const nextStr = `${next.getFullYear()}${padTwo(next.getMonth() + 1)}${padTwo(next.getDate())}`;
    dates = `${dateStr}/${nextStr}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadICS(booking, role) {
  const { eventDate, eventType, title, description, location, vendorName, customerName } = getEventData(booking, role);

  const icsContent = generateICS({
    title,
    description,
    location,
    startDate: eventDate,
    startTime: booking.startTime || null,
    endTime: booking.endTime || null,
    organizerName: role === 'vendor' ? vendorName : customerName,
    organizerEmail: role === 'vendor' ? booking.vendor?.contactEmail : booking.contactEmail,
  });

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = eventDate.toISOString().split('T')[0];
  const filename = `event-nest-${eventType.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AddToCalendarButton({ booking, role }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const statusLower = (booking.status || '').toLowerCase();
  const hasDate = booking.eventDate || booking.date;
  if (!hasDate || !['confirmed', 'completed'].includes(statusLower)) {
    return null;
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        title="Add to calendar"
      >
        <CalendarPlus size={14} />
        <span className="hidden sm:inline">Add to Calendar</span>
        <span className="sm:hidden">Calendar</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px] py-1">
          <a
            href={buildGoogleCalendarUrl(booking, role)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 10h18" stroke="currentColor" strokeWidth="2"/><path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Google Calendar
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); downloadICS(booking, role); setOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Download .ics file
          </button>
          <p className="px-4 py-1.5 text-[11px] text-gray-400">.ics works with Apple, Outlook</p>
        </div>
      )}
    </div>
  );
}
