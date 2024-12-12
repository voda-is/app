import { type ChatroomMessages } from '@/lib/validations';
import Link from 'next/link';
import { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { RiMedalLine } from 'react-icons/ri';

interface LaunchedProps {
  messages: ChatroomMessages;
  characterName: string;
  onStartNewConversation: () => void;
}

export function Launched({ messages, characterName, onStartNewConversation }: LaunchedProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const isFullyLaunched = messages.is_wrapped && 
    messages.function_call && 
    messages.tx_hash;

  if (!isFullyLaunched) return null;

  const baseUrl = "https://sepolia.basescan.org/tx/0x";

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl max-w-md mx-auto w-full">
      <div className="flex flex-col items-center space-y-2">
        <RiMedalLine className="w-8 h-8 text-emerald-400" />
        <h3 className="text-2xl font-bold text-emerald-400">
          Launched!
        </h3>
        <p className="text-sm text-gray-400">
          Endorsed by <span className="text-pink-400">{characterName}</span>
        </p>
      </div>
      
      <div className="space-y-4 text-white w-full">
        {/* Token Properties */}
        <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-emerald-500/10">
          <div className="text-left">
            <p className="text-xs text-gray-400">Token Name</p>
            <p className="font-semibold text-white">
              {messages.function_call?.name}
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Token Symbol</p>
            <p className="font-semibold text-white">
              {messages.function_call?.symbol}
            </p>
          </div>
        </div>

        {/* Collapsible Reasoning */}
        <div className="w-full">
          <button
            onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-300">View Reasoning</span>
            <IoChevronDownOutline 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isReasoningExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isReasoningExpanded && (
            <div className="mt-2 p-3 text-sm text-gray-400 bg-black/20 rounded-lg text-left">
              {messages.function_call?.reasoning}
            </div>
          )}
        </div>

        {/* Transaction Hash */}
        <div className="w-full">
          <p className="text-xs text-gray-400 mb-1 text-left">
            Blockchain Verification
          </p>
          <a 
            href={`${baseUrl}${messages.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full px-4 py-2 bg-white/5 hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-500/10"
          >
            <span className="font-mono text-xs text-gray-300 truncate">
              {messages.tx_hash}
            </span>
            <HiOutlineExternalLink 
              className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-2"
            />
          </a>
        </div>
      </div>

      <button 
        onClick={onStartNewConversation}
        className="mt-2 px-8 py-2.5 bg-emerald-500/80 text-white rounded-xl font-medium transition-colors backdrop-blur-sm"
      >
        Start New Chat
      </button>
    </div>
  );
}