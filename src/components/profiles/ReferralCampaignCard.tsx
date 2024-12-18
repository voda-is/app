import { useState, useEffect } from 'react';
import { FiLink, FiCheck, FiUsers, FiChevronDown, FiLoader } from 'react-icons/fi';
import { useGenerateReferralUrl } from '@/hooks/api';
import { motion, AnimatePresence } from 'framer-motion';

export function ReferralCampaignCard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const { 
    mutate: generateUrl, 
    data: referralUrl, 
    isPending: isGeneratingUrl 
  } = useGenerateReferralUrl();

  // Auto-copy when URL is generated
  useEffect(() => {
    if (referralUrl && !copied) {
      navigator.clipboard.writeText(referralUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
        });
    }
  }, [referralUrl]);

  const handleCopyReferral = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!referralUrl) {
      generateUrl();
      return;
    }

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-900"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <FiUsers className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Referral Campaign</h3>
        </div>
        <FiChevronDown 
          className={`w-5 h-5 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {/* Referral Rules */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold text-emerald-500">+10 points</div>
                  <div className="text-xs text-gray-700">
                    Invite friends to join! Both you and your friend will receive 10 points when they join using your referral link.
                  </div>
                </div>
              </div>

              {/* Generate/Copy Link Button */}
              <button
                onClick={handleCopyReferral}
                disabled={isGeneratingUrl}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 disabled:hover:bg-emerald-500/20 
                  disabled:opacity-50 transition-colors rounded-lg p-3 flex items-center justify-center gap-2"
              >
                {isGeneratingUrl ? (
                  <>
                    <FiLoader className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span className="text-sm text-emerald-500 font-medium tracking-wide">
                      Generating Link...
                    </span>
                  </>
                ) : copied ? (
                  <>
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500 font-medium tracking-wide">
                      Link Copied to Clipboard!
                    </span>
                  </>
                ) : (
                  <>
                    <FiLink className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500 font-medium tracking-wide">
                      {referralUrl ? 'Copy Your Referral Link' : 'Generate Your Referral Link'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 