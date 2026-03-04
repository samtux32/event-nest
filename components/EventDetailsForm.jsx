import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

export default function EventDetailsForm({ formData, onFormChange, blockedDates = [] }) {
  // Build a Set of blocked date strings for fast lookup
  const blockedDateSet = useMemo(() => {
    const set = new Set();
    blockedDates.forEach(bd => {
      const d = new Date(bd.date);
      // Format as YYYY-MM-DD to match input value
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      set.add(str);
    });
    return set;
  }, [blockedDates]);

  const isSelectedDateBlocked = formData.eventDate && blockedDateSet.has(formData.eventDate);

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
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={onFormChange}
            required
            className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-purple-600 ${
              isSelectedDateBlocked ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          {isSelectedDateBlocked && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>This date is unavailable. The vendor has blocked this date. Please choose another date.</span>
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
