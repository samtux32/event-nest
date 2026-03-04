import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

function padTwo(n) {
  return String(n).padStart(2, '0');
}

function CalendarPicker({ value, onChange, blockedDateSet, bookings = [] }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth());
  });
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build set of dates that have existing bookings (confirmed/completed)
  const bookedDateSet = useMemo(() => {
    const set = new Set();
    if (bookings.length > 0) {
      bookings.forEach(b => {
        if (b.eventDate && (b.status === 'confirmed' || b.status === 'completed')) {
          const d = new Date(b.eventDate);
          set.add(`${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`);
        }
      });
    }
    return set;
  }, [bookings]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleSelect = (day) => {
    const dateStr = `${viewDate.getFullYear()}-${padTwo(viewDate.getMonth() + 1)}-${padTwo(day)}`;
    const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (dateObj < today) return;
    if (blockedDateSet.has(dateStr)) return;
    onChange(dateStr);
    setOpen(false);
  };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 border rounded-xl cursor-pointer flex items-center justify-between ${
          value && blockedDateSet.has(value)
            ? 'border-red-400 bg-red-50'
            : open ? 'border-purple-600 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || 'Select a date'}
        </span>
        <CalendarDays size={18} className="text-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-[340px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-gray-900">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${viewDate.getFullYear()}-${padTwo(viewDate.getMonth() + 1)}-${padTwo(day)}`;
              const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isPast = dateObj < today;
              const isBlocked = blockedDateSet.has(dateStr);
              const isBooked = bookedDateSet.has(dateStr);
              const isSelected = dateStr === value;
              const isCurrentDay = dateObj.getTime() === today.getTime();
              const isDisabled = isPast || isBlocked;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !isDisabled && handleSelect(day)}
                  disabled={isDisabled}
                  className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : isBlocked
                        ? 'bg-red-50 text-red-300 line-through cursor-not-allowed'
                        : isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isBooked
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : isCurrentDay
                              ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold'
                              : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isBlocked ? 'Unavailable' : isBooked ? 'Already booked' : ''}
                >
                  {day}
                  {isBooked && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <span className="text-xs text-gray-500">Unavailable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-gray-500">Selected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventDetailsForm({ formData, onFormChange, blockedDates = [], bookings = [] }) {
  const blockedDateSet = useMemo(() => {
    const set = new Set();
    blockedDates.forEach(bd => {
      const d = new Date(bd.date);
      const str = `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
      set.add(str);
    });
    return set;
  }, [blockedDates]);

  const isSelectedDateBlocked = formData.eventDate && blockedDateSet.has(formData.eventDate);

  const handleDateChange = (dateStr) => {
    onFormChange({ target: { name: 'eventDate', value: dateStr } });
  };

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Anniversary',
    'Engagement',
    'Baby Shower',
    'Other'
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Event Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={onFormChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date *
          </label>
          <CalendarPicker
            value={formData.eventDate}
            onChange={handleDateChange}
            blockedDateSet={blockedDateSet}
            bookings={bookings}
          />
          {isSelectedDateBlocked && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>This date is unavailable. Please choose another date.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time *
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={onFormChange}
            required
            className="w-full px-2 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 text-lg font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time *
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={onFormChange}
            required
            className="w-full px-2 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 text-lg font-medium"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Guest Count
        </label>
        <input
          type="number"
          name="guestCount"
          value={formData.guestCount}
          onChange={onFormChange}
          placeholder="e.g., 150"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Name
        </label>
        <input
          type="text"
          name="venueName"
          value={formData.venueName}
          onChange={onFormChange}
          placeholder="e.g., The Grand Ballroom"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Address
        </label>
        <input
          type="text"
          name="venueAddress"
          value={formData.venueAddress}
          onChange={onFormChange}
          placeholder="Full address"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
        />
      </div>
    </div>
  );
}
