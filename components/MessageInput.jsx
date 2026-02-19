import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

export default function MessageInput({ value, onChange, onSend }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <button
          type="button"
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
        >
          <Paperclip size={20} className="text-gray-600" />
        </button>

        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-purple-600 transition-colors">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-3 bg-transparent outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <button
          type="button"
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
        >
          <Smile size={20} className="text-gray-600" />
        </button>

        <button
          type="submit"
          disabled={!value.trim()}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="text-white" />
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2 px-3">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
