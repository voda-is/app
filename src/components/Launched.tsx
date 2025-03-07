import { type ChatroomMessages } from '@/lib/validations';
import Link from 'next/link';
import { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { RiMedalLine, RiLoader4Line } from 'react-icons/ri';
import { FiExternalLink } from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';

interface LaunchedProps {
  messages: ChatroomMessages;
  characterName: string;
  chatroomId: string;
  onStartNewConversation: () => void;
}

export function Launched({ 
  messages, 
  characterName, 
  chatroomId, 
  onStartNewConversation,
}: LaunchedProps) {
  const queryClient = useQueryClient();
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  // const { mutate: launchToken, isPending: isLaunching } = useLaunchToken(() => {
  //   queryClient.invalidateQueries({ queryKey: ["chatroomMessages", chatroomId] });
  // });
  const isWrapped = messages.is_wrapped;
  const isTokenLaunched = !!messages.sol_mint_address && !!messages.sol_create_tx_hash;

  if (!isWrapped) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl max-w-md mx-auto w-full">
      <div className="flex flex-col items-center space-y-2">
        <RiMedalLine className="w-8 h-8 text-emerald-400" />
        <h3 className="text-2xl font-bold text-emerald-400">
          {isTokenLaunched ? 'Launched!' : 'Ready to Launch!'}
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

        {/* Go to History Button */}
        <Link 
          href={`/messages/${chatroomId}/${messages._id}`}
          className="group flex items-center justify-between w-full px-4 py-2 bg-white/5 hover:bg-emerald-900/20 rounded-lg transition-colors border border-emerald-500/10"
        >
          <span className="text-sm text-gray-300">View Full History</span>
          <HiOutlineExternalLink 
            className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors"
          />
        </Link>

        {isTokenLaunched ? (
          <>
            {/* View on Solana Explorer */}
            <a 
              href={`https://solscan.io/tx/${messages.sol_create_tx_hash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <span className="text-sm text-emerald-400">View TX on Solana</span>
              <FiExternalLink className="w-4 h-4 text-emerald-400" />
            </a>

            <a 
              href={`https://solscan.io/account/${messages.sol_mint_address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <span className="text-sm text-emerald-400">View Token on Solana</span>
              <FiExternalLink className="w-4 h-4 text-emerald-400" />
            </a>

            <button 
              onClick={onStartNewConversation}
              className="w-full px-8 py-2.5 bg-emerald-500/80 hover:bg-emerald-500/90 text-white rounded-xl font-medium transition-colors backdrop-blur-sm"
            >
              Start New Chat
            </button>
          </>
        ) : (
          <button 
            onClick={() => console.log('launching')}
            disabled={false}
            className="w-full px-8 py-2.5 bg-emerald-500/80 hover:bg-emerald-500/90 disabled:bg-emerald-500/50 
              disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors backdrop-blur-sm
              flex items-center justify-center gap-2"
          >
            {/* {isLaunching ? (
              <>
                <RiLoader4Line className="w-5 h-5 animate-spin" />
                <span>Launching on Solana...</span>
              </>
            ) : (
              <span>Launch on Solana</span>
            )} */}
            <span>Launch on Solana</span>
          </button>
        )}
      </div>
    </div>
  );
}