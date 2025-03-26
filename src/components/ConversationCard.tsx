'use client';

import { formatDistance } from 'date-fns';
import { IoChatbubble, IoShare } from "react-icons/io5";
import { HiOutlineExternalLink } from "react-icons/hi";
import { ConversationMemory } from "@/lib/types";
import { ReactNode } from 'react';

interface ConversationCardProps {
  conversation: ConversationMemory;
  onClick: () => void;
  variant?: 'default' | 'public';
  isDisabled?: boolean;
  actionButton?: ReactNode;
}

export function ConversationCard({
  conversation,
  onClick,
  variant = 'default',
  isDisabled = false,
  actionButton
}: ConversationCardProps) {
  const isPublic = variant === 'public';
  
  return (
    <div
      className={`flex items-center w-full ${
        isPublic 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/5 hover:bg-white/10 border-white/10'
      } backdrop-blur-md border rounded-xl overflow-hidden group ${
        isDisabled ? 'opacity-75' : ''
      }`}
    >
      <div 
        onClick={isDisabled ? undefined : onClick}
        className={`flex-1 flex items-center gap-4 p-6 ${
          isDisabled 
            ? 'cursor-not-allowed' 
            : 'cursor-pointer hover:bg-white/5' 
        } transition-colors`}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
          isPublic ? 'bg-[#FDB777]/20' : 'bg-[#FDB777]/20'
        } flex items-center justify-center`}>
          {isPublic 
            ? <IoShare className="w-5 h-5 text-[#FDB777]" />
            : <IoChatbubble className="w-5 h-5 text-[#FDB777]" />
          }
        </div>
        <div className="text-left">
          <h3 className="text-white font-medium text-base">
            {conversation.history.length > 0 
              ? conversation.history[0][0].content.substring(0, 30) + (conversation.history[0][0].content.length > 30 ? '...' : '')
              : isPublic ? 'Shared Conversation' : 'New Conversation'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400 mt-1">
            {isPublic && conversation.owner_id && (
              <>
                <span>Shared by {conversation.owner_id.slice(0, 6) + '...' + conversation.owner_id.slice(-4) || "Anonymous"}</span>
                <span className="text-gray-500">•</span>
              </>
            )}
            <span>{conversation.history.length} messages</span>
            <span className="text-gray-500">•</span>
            <span>{formatDistance(new Date(conversation.updated_at * 1000), new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      {actionButton ? (
        <div className="px-2">
          {actionButton}
        </div>
      ) : (
        <div className="px-6">
          <button
            onClick={isDisabled ? undefined : onClick}
            className={`p-3 w-12 h-12 flex items-center justify-center ${
              isDisabled 
                ? 'text-[#FDB777]/40 cursor-not-allowed' 
                : 'text-[#FDB777]/70 hover:text-[#FDB777] hover:bg-[#FDB777]/10'
            } transition-all rounded-full`}
            disabled={isDisabled}
          >
            <HiOutlineExternalLink className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
} 