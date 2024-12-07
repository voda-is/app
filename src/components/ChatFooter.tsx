import { IoMic, IoFlash, IoSend } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface InputBarProps {
  message: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
  seconds?: number;
  isRequesting?: boolean; // 是否为抢麦成功的用户
}

const TIMER_DURATION = 60;

export function ChatFooter({
  message,
  onChange,
  onSend,
  placeholder,
  disabled = true,
  seconds,
  isRequesting = true,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    if (seconds) {
      const newProgress = parseFloat(
        ((TIMER_DURATION - seconds) / TIMER_DURATION).toFixed(2)
      );
      setProgress(newProgress);
    }
  }, [seconds]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePayToChat = () => {
    console.log("pay to chat");

    // 调用支付接口
  };

  const renderGuest = () => {
    return (
      <>
        <div className="flex items-center gap-4">
          <Image src="/chat/smile.png" alt="plus" width={24} height={24} />
          <Image src="/chat/heart.png" alt="plus" width={24} height={24} />
          <Image src="/chat/flower.png" alt="plus" width={24} height={24} />
        </div>
        <button
          onClick={handlePayToChat}
          className="bg-[#10B981] border border-[#10B981] text-white h-[40px] rounded-full"
          style={{
            width: "240px",
          }}
        >
          <div className="flex items-center justify-between gap-2 px-4">
            <div className="text-[14px] text-[#FECF00] bg-[#005E3F] rounded-full px-2 py-1">
              200 Points
            </div>
            <div className="text-[14px] text-white">Pay to Chat</div>
            <Image
              src="/chat/shan-dian.png"
              alt="arrow"
              width={20}
              height={20}
            />
          </div>
        </button>
      </>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 mt-auto">
      {seconds && (
        <div className="relative w-full h-[31px] bg-[#5D5D5D] rounded flex items-center">
          <div
            className="absolute h-full rounded"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: progress > 0 ? "#FFF068" : "#5D5D5D",
            }}
          />
          <div className="text-[14px] text-center text-[#10B981] z-10 w-full">
            The current session ends in {seconds}s
          </div>
        </div>
      )}
      <div className="px-4 pt-4 pb-8 backdrop-blur-md bg-[#171717] flex justify-between">
        {disabled && isRequesting ? (
          renderGuest()
        ) : (
          <>
            <div
              className={`flex items-center gap-2 backdrop-blur-md border border-[rgba(255, 255, 255, 0.7)] py-1 rounded-full px-4 ${
                disabled ? "opacity-50" : ""
              }`}
            >
              <button className="text-gray-400">
                <IoMic size={20} />
              </button>
              <motion.textarea
                ref={textareaRef}
                disabled={disabled}
                rows={1}
                value={message}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto scrollbar-none py-0 h-[24px] leading-[24px]"
              />
              <button className="text-gray-400">
                <IoFlash size={20} />
              </button>
            </div>
            {disabled ? (
              <motion.button
                key="add"
                disabled={disabled}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Image
                  src="/chat/send-gray.png"
                  alt="plus"
                  width={40}
                  height={40}
                />
              </motion.button>
            ) : (
              <AnimatePresence mode="wait">
                {message.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={onSend}
                    className="bg-[#10B981] text-white rounded-full p-2"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
