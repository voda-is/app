import { IoMic, IoFlash, IoAdd, IoSend } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";

interface InputBarProps {
  message: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
}

export function ChatFooter({
  message,
  onChange,
  onSend,
  placeholder,
  disabled,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea only when content exceeds one line
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "24px"; // Reset to single line
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 24) {
        textarea.style.height = `${Math.min(scrollHeight, 120)}px`; // Max height of 120px
      }
    }
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto bg-[#0B0C0C]">
      <div className="p-4 backdrop-blur-md bg-black flex justify-between">
        <div
          className={`flex items-center gap-2 backdrop-blur-md bg-black border border-[rgba(255, 255, 255, 0.7)] py-1 rounded-full px-4 ${
            disabled ? "opacity-50" : ""
          }`}
        >
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
              height: "24px",
              lineHeight: "24px",
              paddingTop: "0",
              paddingBottom: "0",
            }}
          />
          <button className="text-gray-400">
            <IoFlash size={20} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          {message.trim() ? (
            <motion.button
              key="send"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={onSend}
              className="bg-[#10B981] text-black rounded-full p-2"
            >
              <IoSend size={20} />
            </motion.button>
          ) : (
            <motion.button
              key="add"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Image src="/send.png" alt="plus" width={40} height={40} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
