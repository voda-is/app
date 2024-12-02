import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] rounded-2xl px-4 py-3 backdrop-blur-md bg-gray-900/40">
        <div className="flex gap-2 items-center h-4">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </motion.div>
  );
} 