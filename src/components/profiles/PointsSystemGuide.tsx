import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { IoStarOutline, IoChatbubbleEllipsesOutline, IoTrendingUpOutline } from 'react-icons/io5';

export function PointsSystemGuide() {
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'rewards' | 'usage' | 'coming-soon' | null>(null);

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
      <button
        onClick={() => setIsGuideExpanded(!isGuideExpanded)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-900"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center">
            <IoStarOutline className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Points System Guide</h3>
        </div>
        <FiChevronDown 
          className={`w-5 h-5 transition-transform duration-300 ${
            isGuideExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {isGuideExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3">
              {/* Daily Rewards Section */}
              <div 
                className="bg-white/10 rounded-xl p-3 cursor-pointer transition-colors hover:bg-white/20"
                onClick={() => setExpandedSection(expandedSection === 'rewards' ? null : 'rewards')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <IoTrendingUpOutline className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">Daily Rewards</h4>
                  <FiChevronDown 
                    className={`w-5 h-5 ml-auto transition-transform duration-300 ${
                      expandedSection === 'rewards' ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                <AnimatePresence>
                  {expandedSection === 'rewards' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 bg-white/10 rounded-lg p-3">
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-emerald-500">+100 points</div>
                          <div className="text-xs text-gray-700">Free points automatically every 24 hours</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Points Usage Section */}
              <div 
                className="bg-white/10 rounded-xl p-3 cursor-pointer transition-colors hover:bg-white/20"
                onClick={() => setExpandedSection(expandedSection === 'usage' ? null : 'usage')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-400/20 flex items-center justify-center">
                    <IoChatbubbleEllipsesOutline className="w-4 h-4 text-sky-500" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">Points Usage</h4>
                  <FiChevronDown 
                    className={`w-5 h-5 ml-auto transition-transform duration-300 ${
                      expandedSection === 'usage' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {expandedSection === 'usage' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {[
                          { cost: '-1 point', action: 'Send a message to any character' },
                          { cost: '-1 point', action: 'Regenerate a character reply' }
                        ].map((item, index) => (
                          <div 
                            key={index}
                            className="bg-white/10 rounded-lg p-3"
                          >
                            <div className="flex flex-col">
                              <div className="text-sm font-semibold text-sky-500">{item.cost}</div>
                              <div className="text-xs text-gray-700">{item.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Coming Soon Section */}
              <div 
                className="bg-white/10 rounded-xl p-3 cursor-pointer transition-colors hover:bg-white/20"
                onClick={() => setExpandedSection(expandedSection === 'coming-soon' ? null : 'coming-soon')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center">
                    <IoStarOutline className="w-4 h-4 text-rose-500" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">Coming Soon</h4>
                  <FiChevronDown 
                    className={`w-5 h-5 ml-auto transition-transform duration-300 ${
                      expandedSection === 'coming-soon' ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {expandedSection === 'coming-soon' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {[
                          'Special campaign rewards for active users',
                          'Community events with bonus points opportunities',
                          'More ways to earn points coming soon'
                        ].map((feature, index) => (
                          <div 
                            key={index}
                            className="bg-white/10 rounded-lg p-3 flex items-center gap-2"
                          >
                            <div className="w-1 h-1 rounded-full bg-rose-400" />
                            <div className="text-xs text-gray-700">{feature}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 