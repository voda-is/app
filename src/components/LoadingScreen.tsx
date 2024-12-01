import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex gap-2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0
            }}
            className="w-3 h-3 bg-[#FDB777] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2
            }}
            className="w-3 h-3 bg-[#FDB777] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4
            }}
            className="w-3 h-3 bg-[#FDB777] rounded-full"
          />
        </div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-white text-sm"
        >
          Loading...
        </motion.span>
      </motion.div>
    </div>
  );
} 