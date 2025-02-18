'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDown, IoCopy, IoCheckmark } from 'react-icons/io5';
import type { TokenInfo } from '@/lib/validations';

interface WalletCardProps {
  type: 'sol' | 'eth';
  address: string;
  tokenInfo?: TokenInfo;
  expandedCard: 'sol' | 'eth' | null;
  setExpandedCard: (type: 'sol' | 'eth' | null) => void;
  copiedAddress: 'sol' | 'eth' | null;
  onCopy: (text: string, type: 'sol' | 'eth') => void;
}

export function WalletCard({ 
  type, 
  address, 
  tokenInfo,
  expandedCard,
  setExpandedCard,
  copiedAddress,
  onCopy 
}: WalletCardProps) {
  const isExpanded = expandedCard === type;
  const balance = type === 'sol' ? tokenInfo?.sol_balance : tokenInfo?.eth_balance;
  const price = type === 'sol' ? tokenInfo?.sol_price : tokenInfo?.eth_price;
  const name = type === 'sol' ? 'Solana' : 'Ethereum';

  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return (balance / 1_000_000_000).toFixed(2);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
        opacity: 1, y: 0
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <h3 className="font-medium text-gray-100">{name}</h3>
            <p className="text-sm text-gray-300 font-mono mt-1">
              {formatAddress(address)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              initial={false}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCard(isExpanded ? null : type);
              }}
            >
              <IoChevronDown className="w-5 h-5 text-gray-100" />
            </motion.button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(address, type);
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Copy address"
            >
              {copiedAddress === type ? (
                <IoCheckmark className="w-5 h-5 text-emerald-400" />
              ) : (
                <IoCopy className="w-5 h-5 text-gray-100" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/10">
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Balance:</span>
                  <span className="font-medium text-gray-100">
                    {formatBalance(balance || 0)} {type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Price:</span>
                  <span className="font-medium text-gray-100">
                    {formatPrice(price || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Value:</span>
                  <span className="font-medium text-gray-100">
                    {formatPrice((balance || 0) * (price || 0) / 1_000_000_000)}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 