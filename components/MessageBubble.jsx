import React from 'react';
import { FileText } from 'lucide-react';
import QuoteCard from '@/components/QuoteCard';
import DateProposalCard from '@/components/DateProposalCard';

export default function MessageBubble({ message, isCustomer, onQuoteUpdated, onDateAccepted }) {
  if (message.type === 'quote' && message.quote) {
    return (
      <div className={`flex gap-3 ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex flex-col ${message.sender === 'me' ? 'items-end' : ''}`}>
          <QuoteCard
            quote={message.quote}
            isCustomer={isCustomer}
            onQuoteUpdated={onQuoteUpdated}
          />
          <span className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  if (message.type === 'date_proposal') {
    return (
      <div className={`flex gap-3 ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex flex-col ${message.sender === 'me' ? 'items-end' : ''}`}>
          <DateProposalCard
            message={message}
            isCustomer={isCustomer}
            onDateAccepted={onDateAccepted}
          />
          <span className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  if (message.type === 'attachment' && message.attachmentUrl) {
    const isMe = message.sender === 'me';
    return (
      <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
        {!isMe && (
          message.avatar ? (
            <img src={message.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {message.senderName?.[0]?.toUpperCase() || '?'}
            </div>
          )
        )}
        <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
          {message.attachmentType === 'image' ? (
            <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={message.attachmentUrl}
                alt={message.attachmentName || 'Image'}
                className="max-w-xs rounded-2xl border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
              />
            </a>
          ) : (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl max-w-xs hover:opacity-90 transition-opacity ${
                isMe
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <FileText size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium truncate">{message.attachmentName || 'Document'}</span>
            </a>
          )}
          {message.text && (
            <div className={`mt-1.5 max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMe ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-900'
            }`}>
              {message.text}
            </div>
          )}
          <span className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
      {message.sender === 'them' && (
        message.avatar ? (
          <img
            src={message.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {message.senderName?.[0]?.toUpperCase() || '?'}
          </div>
        )
      )}
      <div className={`flex flex-col ${message.sender === 'me' ? 'items-end' : ''}`}>
        <div
          className={`max-w-lg px-4 py-3 rounded-2xl ${
            message.sender === 'me'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</span>
      </div>
    </div>
  );
}
