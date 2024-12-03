import { IoMic, IoFlash, IoAdd, IoSend } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface InputBarProps {
  message: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
}

export function InputBar({ message, onChange, onSend, placeholder, disabled }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea only when content exceeds one line
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px'; // Reset to single line
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 24) {
        textarea.style.height = `${Math.min(scrollHeight, 120)}px`; // Max height of 120px
      }
    }
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="p-4 backdrop-blur-md bg-black/20"
    >
      <div className={`flex items-center gap-2 backdrop-blur-md bg-white/10 rounded-full px-4 py-2 ${disabled ? 'opacity-50' : ''}`}>
        <button className="text-gray-400">
          <IoMic size={20} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto scrollbar-none"
          style={{
            height: '24px',
            lineHeight: '24px',
            paddingTop: '0',
            paddingBottom: '0'
          }}
        />
        <button className="text-gray-400">
          <IoFlash size={20} />
        </button>
        <AnimatePresence mode="wait">
          {message.trim() ? (
            <motion.button
              key="send"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={onSend}
              className="bg-[#FDB777] text-black rounded-full p-2"
            >
              <IoSend size={20} />
            </motion.button>
          ) : (
            <motion.button
              key="add"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white/20 rounded-full p-2 text-gray-400"
            >
              <IoAdd size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 