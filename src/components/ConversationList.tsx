'use client';

import { ConversationMemory, User } from "@/lib/types";
import { ConversationCard } from "./ConversationCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { WalletConnectionBanner } from "./WalletConnectionBanner";

interface ConversationListProps {
  title: React.ReactNode;
  conversations: ConversationMemory[];
  user: User | null;
  variant?: 'default' | 'public';
  emptyStateTitle: string;
  emptyStateDescription: string;
  actionButton?: React.ReactNode;
  onConversationClick: (id: string) => void;
}

export function ConversationList({
  title,
  conversations,
  user,
  variant = 'default',
  emptyStateTitle,
  emptyStateDescription,
  actionButton,
  onConversationClick
}: ConversationListProps) {
  const isPublic = variant === 'public';
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        {title}
      </h2>
      
      <div className="space-y-4">
        {!user ? (
          <WalletConnectionBanner 
            variant="card" 
            message={isPublic 
              ? "Connect your wallet to view public conversations." 
              : "Connect your wallet to start chatting with this character and access all features."
            } 
          />
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationCard
              key={conversation._id}
              conversation={conversation}
              onClick={() => onConversationClick(conversation._id)}
              variant={isPublic ? 'public' : 'default'}
              isDisabled={isPublic && !user}
            />
          ))
        ) : (
          <EmptyStateCard
            variant={isPublic ? 'public' : 'conversations'}
            title={emptyStateTitle}
            description={emptyStateDescription}
            actionButton={actionButton}
          />
        )}
      </div>
    </div>
  );
} 