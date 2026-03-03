'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function useRealtimeChat({ conversationId, selectedConv, onNewMessage, onMessageDeleted }) {
  const channelRef = useRef(null);
  const sentIdsRef = useRef(new Set());
  const supabaseRef = useRef(null);

  // Stable ref for callbacks so channel listener always sees latest
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageDeletedRef = useRef(onMessageDeleted);
  const selectedConvRef = useRef(selectedConv);
  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);
  useEffect(() => { onMessageDeletedRef.current = onMessageDeleted; }, [onMessageDeleted]);
  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);

  useEffect(() => {
    if (!conversationId) return;

    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;

    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        // Skip if we sent this message (belt-and-suspenders — self:false should handle it)
        if (sentIdsRef.current.has(payload.id)) return;

        const conv = selectedConvRef.current;
        const mapped = {
          ...payload,
          sender: 'them',
          senderName: conv?.name || '',
          avatar: conv?.avatar || null,
        };
        onNewMessageRef.current?.(mapped);
      })
      .on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
        onMessageDeletedRef.current?.(payload.messageId);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId]);

  const broadcast = useCallback((event, payload) => {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event, payload });
  }, []);

  const addSentId = useCallback((id) => {
    sentIdsRef.current.add(id);
    // Clean up after 60s to prevent memory leak
    setTimeout(() => sentIdsRef.current.delete(id), 60000);
  }, []);

  return { broadcast, addSentId };
}
