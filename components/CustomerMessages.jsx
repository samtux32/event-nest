'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import ConversationList from '@/components/ConversationList';
import ChatHeader from '@/components/ChatHeader';
import MessageBubble from '@/components/MessageBubble';
import MessageInput from '@/components/MessageInput';
import EventDetailsSidebar from '@/components/EventDetailsSidebar';

export default function CustomerMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Read ?conv= from URL on mount and pre-select that conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conv');
    if (convId) setSelectedConversation(convId);
  }, []);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations');
        const data = await res.json();
        if (res.ok) {
          setConversations(data.conversations);
          // Use functional update so we see the LATEST selectedConversation
          // (not a stale closure value), avoiding overriding the ?conv= URL param
          if (data.conversations.length > 0) {
            setSelectedConversation(prev => prev || data.conversations[0].id);
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleQuoteUpdated = (updatedQuote) => {
    setMessages(prev =>
      prev.map(m =>
        m.quote?.id === updatedQuote.id ? { ...m, quote: updatedQuote } : m
      )
    );
  };

  // When customer accepts a date proposal, update the conversation's eventDate locally
  const handleDateAccepted = (acceptedDate) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== selectedConversation) return c;
        const formatted = new Date(acceptedDate).toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' });
        return { ...c, eventDate: formatted };
      })
    );
    // Also clear the "no date set" banner by reflecting eventDate in the messages
    setMessages(prev =>
      prev.map(m =>
        m.type === 'date_proposal'
          ? { ...m, proposedDate: null, bookingEventDate: acceptedDate }
          : m
      )
    );
  };

  const handleSendMessage = async (text, attachment) => {
    if (!selectedConversation) return;
    if (!text?.trim() && !attachment) return;

    setMessageInput('');

    // Optimistic update
    const tempMessage = {
      id: 'temp-' + Date.now(),
      sender: 'me',
      text: text?.trim() || '',
      type: attachment ? 'attachment' : 'text',
      attachmentUrl: attachment?.url || null,
      attachmentName: attachment?.name || null,
      attachmentType: attachment?.attachmentType || null,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, tempMessage]);

    const preview = attachment ? `📎 ${attachment.name}` : text.trim();
    setConversations(prev =>
      prev.map(c => c.id === selectedConversation
        ? { ...c, lastMessage: preview, timestamp: 'Just now' }
        : c
      )
    );

    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text?.trim() || '',
          attachmentUrl: attachment?.url || null,
          attachmentName: attachment?.name || null,
          attachmentType: attachment?.attachmentType || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id
            ? { ...tempMessage, id: data.message.id, timestamp: data.message.timestamp }
            : m
          )
        );
      } else {
        console.error('Send message failed:', data);
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <CustomerHeader />

      {/* Main Messages Container */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Conversations Sidebar */}
        {loadingConvos ? (
          <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col flex-shrink-0`}>
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
          <div className={mobileView === 'chat' ? 'hidden md:flex md:flex-col w-full md:w-80 lg:w-96 flex-shrink-0' : 'flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0'}>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={(id) => { setSelectedConversation(id); setMobileView('chat'); }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50`}>
          {selectedConv ? (
            <>
              <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
                <button onClick={() => setMobileView('list')} className="flex items-center gap-1 text-purple-600 text-sm font-medium py-1">
                  ← Back
                </button>
              </div>
              <ChatHeader conversation={selectedConv} role="customer" />

              {/* No-date reminder banner */}
              {selectedConv.inquiryStatus === 'Confirmed' && !selectedConv.eventDate && (
                <div className="flex items-start gap-3 bg-amber-50 border-b border-amber-200 px-5 py-3">
                  <span className="text-xl leading-none mt-0.5">📅</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Your booking is confirmed — no date set yet</p>
                    <p className="text-xs text-amber-700 mt-0.5">Let <strong>{selectedConv.name}</strong> know your preferred event date so they can add it to their calendar.</p>
                  </div>
                </div>
              )}

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
                  <>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isCustomer={true}
                        onQuoteUpdated={handleQuoteUpdated}
                        onDateAccepted={handleDateAccepted}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
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
                  {loadingConvos ? '' : 'Start a conversation by messaging a vendor from their profile'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Event Details */}
        {selectedConv && (
          <EventDetailsSidebar conversation={selectedConv} role="customer" messages={messages} />
        )}
      </div>

    </div>
  );
}
