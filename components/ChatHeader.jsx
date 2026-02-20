import React from 'react';
import Link from 'next/link';
import { Circle, FileText } from 'lucide-react';

export default function ChatHeader({ conversation, role, onSendQuote }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {conversation.name?.trim()?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {conversation.online && (
              <Circle
                size={12}
                className="absolute bottom-0 right-0 fill-green-500 text-green-500 border-2 border-white rounded-full"
              />
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg">{conversation.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{conversation.eventType || '—'}</span>
              <span>•</span>
              <span>{conversation.eventDate || '—'}</span>
              {conversation.online && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-medium">Online</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'vendor' && onSendQuote && (
            <button
              onClick={onSendQuote}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <FileText size={14} />
              Send Quote
            </button>
          )}
          {role === 'customer' && conversation.vendorId && (
            <Link
              href={`/vendor-profile/${conversation.vendorId}`}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
