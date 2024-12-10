import { useEffect, useCallback } from "react";
import { HistoryMessage, User } from "./validations";

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
  isReady: boolean,
  handlers: ChatroomEventHandlers
) => {
  const setupEventSource = useCallback(() => {
    if (!isReady) return null;
    // Create EventSource connection
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sse/chatroom/${chatroomId}`
    );

    // Connection opened
    eventSource.onopen = () => {
      console.log("SSE connection established");
    };

    // Listen for specific events
    eventSource.addEventListener("messageReceived", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onMessageReceived?.(data);
      } catch (error) {
        console.error("Error parsing messageReceived event:", error);
      }
    });

    eventSource.addEventListener("responseReceived", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onResponseReceived?.(data);
      } catch (error) {
        console.error("Error parsing responseReceived event:", error);
      }
    });

    eventSource.addEventListener("hijackRegistered", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onHijackRegistered?.(data);
      } catch (error) {
        console.error("Error parsing hijackRegistered event:", error);
      }
    });

    eventSource.addEventListener("hijackSucceeded", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onHijackSucceeded?.(data);
      } catch (error) {
        console.error("Error parsing hijackSucceeded event:", error);
      }
    });

    eventSource.addEventListener("joinChatroom", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onJoinChatroom?.(data);
      } catch (error) {
        console.error("Error parsing joinChatroom event:", error);
      }
    });

    eventSource.addEventListener("leaveChatroom", (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onLeaveChatroom?.(data);
      } catch (error) {
        console.error("Error parsing leaveChatroom event:", error);
      }
    });

    // Handle errors
    eventSource.onerror = (error) => {
      try {
        console.error("SSE error:", error);
        eventSource.close();
      } catch (error) {
        console.error("Error closing SSE connection:", error);
      }
    };

    return eventSource;
  }, [chatroomId, handlers, isReady]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    if (isReady) {
      eventSource = setupEventSource();
    }
    // Cleanup on unmount
    return () => {
      eventSource?.close();
    };
  }, [setupEventSource, isReady]);
};
