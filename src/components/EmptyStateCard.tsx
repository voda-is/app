'use client';

import { ReactNode } from 'react';
import { IoChatbubble, IoShare } from "react-icons/io5";

interface EmptyStateCardProps {
  variant: 'conversations' | 'public';
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export function EmptyStateCard({
  variant,
  title,
  description,
  actionButton
}: EmptyStateCardProps) {
  const isPublic = variant === 'public';
  
  return (
    <div className={`text-center py-12 ${
      isPublic 
        ? 'bg-white/5 border-white/10' 
        : 'bg-white/5 border-white/10'
    } backdrop-blur-md rounded-xl border`}>
      <div className="flex justify-center mb-4">
        <div className={`w-16 h-16 rounded-full ${
          isPublic 
            ? 'bg-[#FDB777]/20' 
            : 'bg-[#FDB777]/20'
        } flex items-center justify-center`}>
          {isPublic 
            ? <IoShare className="w-8 h-8 text-[#FDB777]/60" />
            : <IoChatbubble className="w-8 h-8 text-[#FDB777]/60" />
          }
        </div>
      </div>
      <p className="text-white text-lg font-medium">{title}</p>
      <p className="text-gray-400 mt-2 max-w-md mx-auto text-sm">
        {description}
      </p>
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
    </div>
  );
} 