'use client';

import React, { useState, useEffect } from 'react';
import VendorHeader from '@/components/VendorHeader';
import ConversationList from '@/components/ConversationList';
import ChatHeader from '@/components/ChatHeader';
import MessageBubble from '@/components/MessageBubble';
import MessageInput from '@/components/MessageInput';
import EventDetailsSidebar from '@/components/EventDetailsSidebar';
import { MessageCircle } from 'lucide-react';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations');
        const data = await res.json();
        if (res.ok) {
          setConversations(data.conversations);
          if (data.conversations.length > 0 && !selectedConversation) {
            setSelectedConversation(data.conversations[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoadingConvos(false);
      }
    }

    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${selectedConversation}/messages`);
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages);
          // Clear unread count locally
          setConversations(prev =>
            prev.map(c => c.id === selectedConversation ? { ...c, unread: 0 } : c)
          );
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [selectedConversation]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const text = messageInput.trim();
    setMessageInput('');

    // Optimistic update
    const tempMessage = {
      id: 'temp-' + Date.now(),
      sender: 'me',
      text,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, tempMessage]);

    // Update conversation's last message locally
    setConversations(prev =>
      prev.map(c => c.id === selectedConversation
        ? { ...c, lastMessage: text, timestamp: 'Just now' }
        : c
      )
    );

    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        // Replace temp message with real one
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? data.message : m)
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <VendorHeader />

      {/* Main Messages Container */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Conversations Sidebar */}
        {loadingConvos ? (
          <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConv ? (
            <>
              <ChatHeader conversation={selectedConv} role="vendor" />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                        <div className={`h-16 bg-gray-200 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
              </div>

              <MessageInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-lg font-medium">
                  {loadingConvos ? 'Loading conversations...' : 'No conversations yet'}
                </p>
                <p className="text-sm">
                  {loadingConvos ? '' : 'Conversations will appear here when customers message you'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Event Details */}
        {selectedConv && (
          <EventDetailsSidebar conversation={selectedConv} />
        )}
      </div>
    </div>
  );
}
