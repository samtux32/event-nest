import React from 'react';
import { Search, Circle } from 'lucide-react';

export default function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  searchQuery,
  onSearchChange 
}) {
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
              selectedConversation === conv.id
                ? 'bg-purple-50 border-l-4 border-l-purple-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                {conv.avatar ? (
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {conv.name?.trim()?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {conv.online && (
                  <Circle
                    size={12}
                    className="absolute bottom-0 right-0 fill-green-500 text-green-500 border-2 border-white rounded-full"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {conv.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-2">{conv.lastMessage}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    conv.inquiryStatus === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    conv.inquiryStatus === 'Active' ? 'bg-blue-100 text-blue-700' :
                    conv.inquiryStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {conv.inquiryStatus}
                  </span>
                  <span className="text-xs text-gray-500">{conv.eventDate}</span>
                  {conv.unread > 0 && (
                    <span className="ml-auto bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
