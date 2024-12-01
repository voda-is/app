import { motion } from "framer-motion";
import { IoWarning, IoRefresh, IoStar, IoStarOutline } from "react-icons/io5";
import { useState } from "react";

interface ChatBubbleProps {
  text: string;
  type: 'narrative' | 'dialogue' | 'user';
  timestamp?: string;
  index: number;
  status?: 'error' | 'sent';
  isLatestReply?: boolean;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onRate?: (rating: number) => void;
}

export function ChatBubble({ 
  text, 
  type, 
  timestamp, 
  index, 
  status, 
  isLatestReply,
  onRetry,
  onRegenerate,
  onRate 
}: ChatBubbleProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);

  const handleStarClick = (rating: number) => {
    setSelectedStars(rating);
    onRate?.(rating);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
    >
      <div className={`flex items-center gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}>
        {type === 'user' && status === 'error' && (
          <button 
            onClick={onRetry}
            className="bg-red-500/20 p-2 rounded-full hover:bg-red-500/30 transition-colors"
          >
            <IoWarning className="w-5 h-5 text-red-500" />
          </button>
        )}
        <div 
          className={`min-w-[120px] max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-md ${
            type === 'narrative' 
              ? 'bg-black/40 text-gray-300 italic'
              : type === 'user'
              ? 'bg-[#FDB777]/90 text-black'
              : 'bg-black/40 text-white'
          }`}
        >
          <p className={`break-all ${type === 'narrative' ? 'opacity-90' : 'opacity-100'}`}>
            {text}
          </p>
          {timestamp && (
            <p className="text-xs opacity-70 mt-1 whitespace-nowrap">
              {timestamp}
            </p>
          )}
          
          {/* Action buttons for latest system reply */}
          {isLatestReply && type !== 'user' && (
            <>
              <div className="h-[1px] bg-white/10 my-3" />
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onRegenerate}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <IoRefresh className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm break-all">Regenerate response</span>
                </button>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm text-gray-300 whitespace-nowrap">Rate this response:</span>
                  <div className="flex gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="text-gray-400 hover:text-[#FDB777] transition-colors"
                      >
                        {star <= (hoveredStar || selectedStars) ? (
                          <IoStar className="w-4 h-4 text-[#FDB777]" />
                        ) : (
                          <IoStarOutline className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
} 