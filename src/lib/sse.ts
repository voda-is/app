import { useEffect, useCallback } from 'react';
import { HistoryMessage, User } from './validations';

interface ChatroomEventHandlers {
  onMessageReceived?: (message: HistoryMessage) => void;
  onResponseReceived?: (response: HistoryMessage) => void;
  onHijackRegistered?: (data: { user: User; cost: number }) => void;
  onHijackSucceeded?: (data: { user: User; nonce: string }) => void;
  onJoinChatroom?: (data: { user: User }) => void;
  onLeaveChatroom?: (data: { user: User; user_id: string }) => void;
}

export const useChatroomEvents = (
  chatroomId: string,
  handlers: ChatroomEventHandlers
) => {
  const setupEventSource = useCallback(() => {
    // Create EventSource connection
    const eventSource = new EventSource(
      `http://localhost:3033/sse/chatroom/${chatroomId}`
    );

    // Connection opened
    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    // Listen for specific events
    eventSource.addEventListener('messageReceived', (event) => {
      const data = JSON.parse(event.data);
      handlers.onMessageReceived?.(data);
    });

    eventSource.addEventListener('responseReceived', (event) => {
      const data = JSON.parse(event.data);
      handlers.onResponseReceived?.(data);
    });

    eventSource.addEventListener('hijackRegistered', (event) => {
      const data = JSON.parse(event.data);
      handlers.onHijackRegistered?.(data);
    });

    eventSource.addEventListener('hijackSucceeded', (event) => {
      const data = JSON.parse(event.data);
      handlers.onHijackSucceeded?.(data);
    });

    eventSource.addEventListener('joinChatroom', (event) => {
      const data = JSON.parse(event.data);
      handlers.onJoinChatroom?.(data);
    });

    eventSource.addEventListener('leaveChatroom', (event) => {
      const data = JSON.parse(event.data);
      handlers.onLeaveChatroom?.(data);
    });

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return eventSource;
  }, [chatroomId, handlers]);

  useEffect(() => {
    const eventSource = setupEventSource();

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [setupEventSource]);
};