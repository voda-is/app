'use client';

import { motion } from "framer-motion";
import { IoRefresh, IoWarning } from "react-icons/io5";
import { HistoryMessage } from "@/lib/validations";
import { FormattedText } from "@/components/FormattedText";
import { useState } from 'react';

interface ChatBubbleProps extends HistoryMessage {
  index: number;
  isLatestReply?: boolean;
  onRetry?: (index: number) => void;
  onRegenerate?: () => void;
  onRate?: (rating: number) => void;
}

export function ChatBubble({ 
  role,
  text,
  created_at,
  index,
  isLatestReply,
  onRetry,
  onRegenerate,
  onRate,
  status = 'sent'
}: ChatBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const timestamp = new Date(created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Determine bubble style based on role
  const getBubbleStyle = () => {
    if (isUser) return 'bg-[#FDB777] text-black';
    if (isAssistant) return 'bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white';
    return 'bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white'; // default style
  };

  // State to track the current rating
  const [currentRating, setCurrentRating] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Retry indicator - only show for failed user messages */}
      {isUser && onRetry && (
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/70 backdrop-blur-md border border-red-500/50 shadow-lg cursor-pointer"
          onClick={() => onRetry(index)}
        >
          <IoWarning className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className={`max-w-[90%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 text-sm ${getBubbleStyle()}`}>
          {/* Message content */}
          <div className="mb-2">
            {text && (
              <FormattedText 
                text={text}
                skipFormatting={isUser}
              />
            )}
          </div>

          {/* Timestamp and controls container */}
          <div className="border-t border-white/10 mt-2 pt-2">
            {/* Timestamp */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isUser ? 'text-black/70' : 'text-white/70'}`}>
                {timestamp}
              </span>
            </div>

            {/* Controls for assistant messages */}
            {isLatestReply && !isUser && (
              <div className="flex flex-col gap-2 mt-2">
                {/* Regenerate button */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <IoRefresh className="w-4 h-4" />
                    Regenerate
                  </button>
                )}

                {/* Rating stars with text */}
                {onRate && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Rate this response:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setCurrentRating(rating);
                            onRate(rating);
                          }}
                          className={`transition-colors ${rating <= currentRating ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {status === 'error' && (
        <div className="error-indicator">
          <IoWarning className="h-5 w-5 text-red-500" />
        </div>
      )}
    </motion.div>
  );
} 