// hooks/useActionCable.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { createConsumer } from '@rails/actioncable';

interface CableMessage {
  type: string;
  message?: any;
  user?: any;
  is_typing?: boolean;
  reader_id?: number;
  count?: number;
}

interface UseActionCableOptions {
  channel: string;
  room: string | number;
  onReceived: (data: CableMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useActionCable = ({
  channel,
  room,
  onReceived,
  onConnected,
  onDisconnected,
}: UseActionCableOptions) => {
  const [connected, setConnected] = useState(false);
  const cableRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for WebSocket authentication');
      return;
    }

    // Create cable connection
    const cable = createConsumer(
      `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/cable?token=${token}`
    );

    cableRef.current = cable;

    // Subscribe to channel
    const subscription = cable.subscriptions.create(
      {
        channel: channel,
        match_id: room,
      },
      {
        connected() {
          console.log(`✅ Connected to ${channel}`);
          setConnected(true);
          onConnected?.();
        },
        disconnected() {
          console.log(`❌ Disconnected from ${channel}`);
          setConnected(false);
          onDisconnected?.();
        },
        received(data: CableMessage) {
          console.log('📨 Received:', data);
          onReceived(data);
        },
      }
    );

    subscriptionRef.current = subscription;

    // Cleanup on unmount
    return () => {
      subscription?.unsubscribe();
      cable?.disconnect();
      setConnected(false);
    };
  }, [channel, room]);

  // Send message via WebSocket
  const sendMessage = useCallback((content: string) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.perform('send_message', { content });
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.perform('typing', { is_typing: isTyping });
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.perform('mark_as_read', {});
    }
  }, []);

  return {
    connected,
    sendMessage,
    sendTyping,
    markAsRead,
  };
};
