import React from 'react';
import Link from 'next/link';
import { Calendar, Star, MapPin } from 'lucide-react';

export default function EventDetailsSidebar({ conversation, role = 'vendor' }) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">Event Details</h3>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="text-purple-600" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Event Date</p>
            <p className="font-medium">{conversation.eventDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Event Type</p>
            <p className="font-medium">{conversation.eventType}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="text-green-600" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Venue</p>
            <p className="font-medium">{conversation.venueName || 'Not specified'}</p>
            {conversation.venueAddress && (
              <p className="text-sm text-gray-500">{conversation.venueAddress}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-bold mb-3">Quick Actions</h4>
        <div className="space-y-2">
          {role === 'vendor' ? (
            conversation.bookingId ? (
              <Link
                href={`/calendar?bookingId=${conversation.bookingId}`}
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-center"
              >
                View Booking
              </Link>
            ) : (
              <Link
                href="/calendar"
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-center"
              >
                View Calendar
              </Link>
            )
          ) : (
            conversation.bookingId ? (
              <Link
                href="/my-bookings"
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-center"
              >
                View Booking
              </Link>
            ) : (
              <Link
                href={`/vendor-profile/${conversation.vendorId}`}
                className="block w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-center"
              >
                View Profile
              </Link>
            )
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 mt-4">
        <h4 className="font-bold mb-3">Shared Files</h4>
        <p className="text-sm text-gray-500">No files shared yet</p>
      </div>
    </div>
  );
}
