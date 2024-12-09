"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  useCharacter,
  useChatroom,
  useChatroomMessages,
  useTelegramUser,
} from "@/hooks/api";
import { HistoryMessage, User } from "@/lib/validations";
import {
  isOnTelegram,
  notificationOccurred,
  setupTelegramInterface,
} from "@/lib/telegram";
import { InputBar } from "@/components/InputBar";
import { api } from "@/lib/api-client";
import { ChatroomHeader } from "@/components/ChatroomHeader";
import { ChatroomFooter } from "@/components/ChatroomFooter";
import { replacePlaceholders } from "@/lib/formatText";
import { useChatroomEvents } from "@/lib/sse";
import { UsersExpandedView } from "@/components/UsersExpandedView";
import { UserProfilesCache } from "@/lib/userProfilesCache";

export default function ChatroomPage() {
  const params = useParams();
  const chatroomId = params?.id as string;
  const router = useRouter();
  const cache = new UserProfilesCache();
  const [messages, setMessages] = useState<HistoryMessage[][]>([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [hijackCost, setHijackCost] = useState(0);
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);

  const { data: chatroom, isLoading: chatroomLoading } =
    useChatroom(chatroomId);
  const { data: character, isLoading: characterLoading } = useCharacter(
    chatroom?.character_id
  );
  const { data: chatroomMessages, isLoading: chatroomMessagesLoading } =
    useChatroomMessages(chatroomId);
  const { data: telegramUser } = useTelegramUser();

  const [currentUserIds, setCurrentUserIds] = useState<string[]>(
    chatroom?.current_audience || []
  );

  // Helper function to ensure user profiles are loaded
  const ensureUserProfiles = async (userIds: string[]) => {
    const missingIds = userIds.filter((id) => !cache.hasUser(id));

    if (missingIds.length > 0) {
      const users = await api.user.getUsers(missingIds);
      cache.addUsers(users);
    }
  };

  // Helper function to collect unique user IDs from messages
  const extractUserIdsFromMessages = (history: HistoryMessage[][]) => {
    return Array.from(
      new Set(
        history.flatMap((pair) =>
          pair.filter((msg) => msg.user_id).map((msg) => msg.user_id)
        )
      )
    );
  };

  // Initial data loading
  useEffect(() => {
    if (!chatroom || !chatroomMessages) return;

    const userIds = new Set<string>();

    // Add current audience
    chatroom.current_audience?.forEach((id) => userIds.add(id));

    // Add user on stage
    if (chatroom.user_on_stage) {
      userIds.add(chatroom.user_on_stage);
    }

    if (chatroom.current_audience) {
      setCurrentUserIds(chatroom.current_audience);
    }

    // Add message authors
    if (chatroomMessages.history) {
      extractUserIdsFromMessages(chatroomMessages.history).forEach((id) =>
        userIds.add(id)
      );
      setMessages(chatroomMessages.history);
    }

    // Load all unique user profiles
    const uniqueUserIds = Array.from(userIds);
    if (uniqueUserIds.length > 0) {
      ensureUserProfiles(uniqueUserIds);
    }
  }, [chatroom, chatroomMessages]);

  // Update SSE event handlers with console logs
  useChatroomEvents(chatroomId, {
    onMessageReceived: async (message) => {
      if (message.user_id) {
        await ensureUserProfiles([message.user_id]);
      }
      setMessages((prev) => {
        const lastPair = prev[prev.length - 1];
        if (lastPair && !lastPair[1]) {
          return [...prev.slice(0, -1), [lastPair[0], message]];
        }
        return [...prev, [message]];
      });
    },
    onResponseReceived: (response) => {
      setShowTypingIndicator(false);
      setMessages((prev) => {
        const lastPair = prev[prev.length - 1];
        if (lastPair && !lastPair[1]) {
          return [...prev.slice(0, -1), [lastPair[0], response]];
        }
        return [...prev, [response]];
      });
    },
    onHijackRegistered: (hijack) => {
      ensureUserProfiles([hijack.user._id]);
      setDisableActions(true);
    },
    onHijackSucceeded: (hijack) => {
      ensureUserProfiles([hijack.user._id]);
      setDisableActions(false);
      setIsCurrentSpeaker(hijack.user._id === telegramUser?._id);
    },
    onJoinChatroom: async (join) => {
      if (join.user._id) {
        await ensureUserProfiles([join.user._id]);
        setCurrentUserIds((prev) => {
          if (prev.includes(join.user._id)) return prev;
          return [...prev, join.user._id];
        });
      }
    },
    onLeaveChatroom: (leave) => {
      setCurrentUserIds((prev) => prev.filter((id) => id !== leave.user_id));
    },
  });

  // Add debug logging for user profile updates
  // useEffect(() => {
  //   const cache = getUserProfilesCache();
  //   console.log("Current cache state:", cache.getAllUsers());
  // }, [messages, currentUserIds]);

  const [inputMessage, setInputMessage] = useState("");
  const [disableActions, setDisableActions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    if (isOnTelegram()) {
      setupTelegramInterface(router);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    setDisableActions(false);
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    const fetchHijackCost = async () => {
      try {
        const cost = await api.chatroom.getHijackCost(chatroomId);
        setHijackCost(cost["cost"]);
      } catch (error) {
        console.error("Failed to fetch hijack cost:", error);
      }
    };
    fetchHijackCost();
  }, [chatroomId]);

  useEffect(() => {
    if (!chatroomId || !telegramUser?._id) {
      console.log("Missing chatroomId or user, skipping join room");
      return;
    }

    const joinRoom = async () => {
      try {
        console.log("Joining room:", chatroomId);
        await api.chatroom.joinChatroom(chatroomId);
        console.log("Successfully joined room");
      } catch (error) {
        console.error("Failed to join room:", error);
      }
    };

    // Join the room
    joinRoom();

    // Leave the room when the component unmounts
    return () => {
      const leaveRoom = async () => {
        try {
          console.log("Leaving room:", chatroomId);
          await api.chatroom.leaveChatroom(chatroomId);
          console.log("Successfully left room");
        } catch (error) {
          console.error("Failed to leave room:", error);
        }
      };

      // Only attempt to leave if we have both chatroomId and user
      if (chatroomId && telegramUser?._id) {
        leaveRoom();
      }
    };
  }, [chatroomId, telegramUser?._id]); // Dependencies ensure this runs when needed

  const handleSendMessage = async () => {
    if (disableActions) return;
    setDisableActions(true);
    setShowTypingIndicator(true);

    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    setInputMessage(""); // Clear input immediately

    try {
      await api.chatroom.chat(chatroomId, trimmedMessage);
      setShowTypingIndicator(false);
      setDisableActions(false);
      notificationOccurred("success");
    } catch (error) {
      console.error("Failed to send message:", error);
      setShowTypingIndicator(false);
      setDisableActions(false);
    }
  };

  const handleHijack = async () => {
    if (disableActions) return;
    setDisableActions(true);

    try {
      await api.chatroom.registerHijack(chatroomId);
      await api.chatroom.hijackChatroom(chatroomId);
      setIsCurrentSpeaker(true);
      notificationOccurred("success");
    } catch (error) {
      console.error("Failed to hijack conversation:", error);
    } finally {
      setDisableActions(false);
    }
  };

  const handleReaction = async (type: string) => {
    if (disableActions) return;
    console.log(`Reaction: ${type}`);
  };

  // Update the recentUsers transformation to use local userProfiles state
  const recentUsers = currentUserIds
    .slice(0, 3)
    .map((id) => {
      return cache.getUser(id);
    })
    .filter(Boolean)
    .map((user: any) => ({
      id: user._id,
      name: user.first_name,
      avatar_url: user.profile_photo || "/bg2.png",
    }));

  console.log("messages👏👏", messages);
  // Message rendering with proper user avatars
  const renderMessages = messages.flatMap((pair: any, index) => [
    // User message
    <div key={`${pair[0].created_at}-${index}`}>
      <ChatBubble
        message={pair[0].text}
        role="user"
        created_at={pair[0].created_at}
        status={pair[0].status}
        assistantAvatar={character?.avatar_image_url}
        userAvatar={pair[0].user?.profile_photo || "/bg2.png"} // Use message user's avatar
        characterId={character?._id}
        enableVoice={character?.metadata.enable_voice}
        isLatestReply={false}
        onRegenerate={() => {}}
        onRetry={() => {}}
        onRate={() => {}}
      />
    </div>,
    // Assistant message
    <div key={`assistant-${index}`}>
      {!pair[1] || !pair[1].text ? null : (
        <ChatBubble
          message={pair[1].text}
          role="assistant"
          created_at={pair[1].created_at}
          status={pair[1].status}
          assistantAvatar={character?.avatar_image_url}
          userAvatar={character?.avatar_image_url} // Assistant always uses character avatar
          characterId={character?._id}
          enableVoice={character?.metadata.enable_voice}
          isLatestReply={index === messages.length - 1}
          onRegenerate={() => {}}
          onRetry={() => {}}
          onRate={() => {}}
        />
      )}
    </div>,
  ]);

  if (characterLoading || !character) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex flex-col w-full bg-black min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image
          src={character?.background_image_url || "/bg2.png"}
          alt="background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-black/20 h-40">
          <ChatroomHeader
            name={character?.name as string}
            image={character?.avatar_image_url || "/bg2.png"}
            userCount={currentUserIds.length}
            recentUsers={recentUsers}
            latestJoinedUser={recentUsers[0]?.name}
            onUsersClick={() => setIsUsersExpanded(true)}
            className="flex-shrink-0 h-16 pt-[var(--tg-content-safe-area-inset-top)]"
          />
        </div>

        {/* Messages Container */}
        <div ref={scrollRef} className="flex-1 pt-42 pb-10">
          <div className="flex flex-col space-y-4 p-4">
            {/* Description */}
            <div className="flex justify-center">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white p-6 rounded-2xl max-w-md">
                <div className="text-lg font-semibold mb-2 text-center text-pink-300">
                  Public Chatroom
                </div>
                <div className="text-sm leading-relaxed text-gray-100">
                  {character?.description}
                </div>
              </div>
            </div>

            <ChatBubble
              message={replacePlaceholders(
                character?.prompts.first_message as string,
                character?.name as string,
                telegramUser?.first_name as string
              )}
              role="assistant"
              created_at={chatroom?.created_at || 0}
              assistantAvatar={character?.avatar_image_url}
              userAvatar={character?.avatar_image_url || "/bg2.png"}
              characterId={character._id}
              enableVoice={character?.metadata.enable_voice}
              isLatestReply={false}
              onRegenerate={() => {}}
              onRetry={() => {}}
              onRate={() => {}}
              status={"sent"}
            />

            {/* Messages */}
            {renderMessages}

            {/* Typing Indicator */}
            {showTypingIndicator && <TypingIndicator />}

            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        {/* Input Container - Conditionally render InputBar or ChatroomFooter */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto">
          {telegramUser?._id === chatroom?.user_on_stage ? (
            <InputBar
              message={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              placeholder={`Message ${character?.name}`}
              disabled={disableActions}
            />
          ) : (
            <ChatroomFooter
              isCurrentSpeaker={isCurrentSpeaker}
              hijackCost={hijackCost}
              onHijack={handleHijack}
              onReaction={handleReaction}
              disabled={disableActions}
            />
          )}
        </div>

        <UsersExpandedView
          isExpanded={isUsersExpanded}
          onClose={() => setIsUsersExpanded(false)}
          currentUserIds={currentUserIds}
          userOnStageId={chatroom?.user_on_stage}
        />
      </div>
    </main>
  );
}
