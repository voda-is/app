import { type ChatroomMessages } from '@/lib/validations';
import Link from 'next/link';
import { useState } from 'react';

interface LaunchedProps {
  messages: ChatroomMessages;
}

export function Launched({ messages }: LaunchedProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const isFullyLaunched = messages.is_wrapped && 
    messages.function_call && 
    messages.tx_hash;

  if (!isFullyLaunched) return null;

  const baseUrl = "https://sepolia.basescan.org/tx/";

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center bg-white/25 backdrop-blur-md border border-white/10 rounded-2xl max-w-md mx-auto w-full">
      <h3 className="text-2xl font-bold text-emerald-400/80">
        Launched!
      </h3>
      
      <div className="space-y-4 text-white w-full">
        {/* Token Properties */}
        <div className="space-y-3 p-4 bg-black/20 rounded-xl">
          <div className="text-left">
            <p className="text-xs text-gray-400">Name</p>
            <p className="font-semibold text-white">
              {messages.function_call?.name}
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">Symbol</p>
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
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isReasoningExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
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
            Transaction Hash
          </p>
          <a 
            href={`${baseUrl}${messages.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full px-4 py-2 bg-white/5 hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            <span className="font-mono text-xs text-gray-300 truncate">
              {messages.tx_hash}
            </span>
            <svg 
              className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-2"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        </div>
      </div>

      <Link 
        href="/explore"
        className="mt-2 px-8 py-2.5 bg-emerald-500/80 text-white rounded-xl font-medium transition-colors backdrop-blur-sm"
      >
        Start New Chat
      </Link>
    </div>
  );
}