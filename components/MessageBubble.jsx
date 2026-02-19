import React from 'react';

export default function MessageBubble({ message }) {
  return (
    <div className={`flex gap-3 ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
      {message.sender === 'them' && (
        <img
          src={message.avatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
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
