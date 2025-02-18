"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoRefresh, IoWarning } from "react-icons/io5";
import { GiSoundWaves } from "react-icons/gi";
import { FormattedText } from "@/components/FormattedText";
import { useState, useMemo, useEffect } from "react";
import { useTTS } from "@/hooks/api";
import { extractText } from "@/lib/formatText";
import { ProgressBarButton } from "./ProgressBarButton";
import Image from "next/image";
import { Message } from "@/lib/chat-context";
import { FiChevronDown } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: Message;
  isChatroom?: boolean;
  onRetry?: (text: string) => void;
  onRegenerate?: () => void;
  onRate?: (rating: number) => void;
}

export function ChatBubble({
  message,
  isChatroom = false,
  onRetry,
  onRegenerate,
  onRate,
}: ChatBubbleProps) {
  if (!message) return null;

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const timestamp = useMemo(() => {
    if (!message.createdAt) return "Processing...";

    // Convert Unix seconds to milliseconds
    const timestampMs = message.createdAt * 1000;

    try {
      const formattedDate = new Date(timestampMs).toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // This will use 12-hour format with AM/PM
      });

      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Processing...";
    }
  }, [message.createdAt]);

  // Determine bubble style based on role
  const getBubbleStyle = () => {
    if (isUser)
      return "bg-emerald-500/60 backdrop-blur-md border border-emerald-500/20 text-white shadow-lg";
    if (isAssistant)
      return "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white";
    return "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white";
  };

  // State to track the current rating
  const [currentRating, setCurrentRating] = useState(0);

  const { mutate: generateTTS, isPending: isTTSLoading } = useTTS();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Extract text once and memoize it
  const ttsText = useMemo(() => extractText(message.message).join(" "), [message]);

  const audioUrl = useMemo(
    () => (audioBlob ? URL.createObjectURL(audioBlob) : null),
    [audioBlob]
  );

  // Clean up the URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioUrl && audioElement) {
      // Make sure audio is loaded
      audioElement.load();

      // Wait for audio to be loaded before playing
      const playAudio = () => {
        audioElement.play().catch((error) => {
          console.error("Error auto-playing audio:", error);
        });
      };

      // Add event listener for when audio is ready
      audioElement.addEventListener("canplaythrough", playAudio, {
        once: true,
      });

      // Cleanup
      return () => {
        audioElement.removeEventListener("canplaythrough", playAudio);
      };
    }
  }, [audioUrl, audioElement]);

  const handleTTSClick = async () => {
    generateTTS(
      { text: ttsText, characterId: message.character._id || "" },
      {
        onSuccess: (entry) => {
          // Check if the entry.audioBlob is valid
          if (!entry.audioBlob || entry.audioBlob.size === 0) {
            console.error("Received empty audio blob");
            return;
          }

          // Try to create a blob with explicit audio type
          const audioBlob = new Blob([entry.audioBlob], {
            type: "audio/mp3",
          });

          setAudioBlob(audioBlob);
        },
        onError: (error) => {
          console.error("TTS generation failed:", error);
        },
      }
    );
  };

  const [isEvaluationExpanded, setIsEvaluationExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`flex items-start gap-3 md:gap-4 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className={`max-w-[90%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base ${getBubbleStyle()}`}>
          {/* Avatar and Message Header */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="relative w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
              <Image
                src={
                  (isUser ? message.user.profile_photo : message.character.avatar_image_url) || "/bg2.png"
                }
                alt={isUser ? "User" : "Assistant"}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <span className="text-xs md:text-sm text-white/70">{timestamp}</span>
          </div>

          {/* Message content */}
          <div className="mb-2">
            {!isUser && message.enableVoice && !audioBlob && (
              <button
                onClick={handleTTSClick}
                disabled={isTTSLoading}
                className={`
                  flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg 
                  ${
                    isTTSLoading
                      ? "bg-white/5 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20 active:scale-95"
                  }
                  text-white/80 hover:text-white 
                  transition-all duration-200 
                  mb-3 w-fit
                `}
              >
                <GiSoundWaves className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-sm md:text-base font-medium">
                  {isTTSLoading ? "Generating..." : "Listen"}
                </span>
              </button>
            )}

            {audioBlob && audioUrl && (
              <div className="flex flex-col gap-2 mb-3">
                <audio
                  ref={(element) => {
                    if (element && !audioElement) {
                      setAudioElement(element);
                    }
                  }}
                  src={audioUrl}
                  style={{ display: "none" }}
                  onLoadedMetadata={() => {
                    if (audioElement) {
                      setDuration(audioElement.duration);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  onTimeUpdate={() => {
                    if (audioElement) {
                      setCurrentTime(audioElement.currentTime);
                    }
                  }}
                />

                <ProgressBarButton
                  isActive={isPlaying}
                  duration={duration}
                  progress={currentTime}
                  onClick={() => {
                    if (audioElement) {
                      if (isPlaying) {
                        audioElement.pause();
                      } else {
                        if (audioElement.ended) {
                          audioElement.currentTime = 0;
                        }
                        audioElement.play().catch((error) => {
                          console.error("Error playing audio:", error);
                        });
                      }
                    }
                  }}
                >
                  <GiSoundWaves
                    className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm font-medium">
                    {isPlaying ? "Playing..." : "Play Audio"}
                  </span>
                  <span className="text-xs text-white/60">
                    {Math.ceil(duration)}"
                  </span>
                </ProgressBarButton>
              </div>
            )}

            {/* Message Text */}
            <div className="pt-2 md:text-base">
              {message && (
                <FormattedText text={message.message} skipFormatting={isUser} isChatroom={isChatroom} />
              )}
            </div>
          </div>

          {/* Evaluation Section */}
          {message.evaluation && !isUser && (
            <div className="w-full border-t border-white/10 pt-2 mt-2">
              <button
                onClick={() => setIsEvaluationExpanded(!isEvaluationExpanded)}
                className="w-full flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
              >
                <FiChevronDown 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isEvaluationExpanded ? 'rotate-180' : ''
                  }`}
                />
                {isEvaluationExpanded ? 'Hide Evaluation' : 'Show Evaluation'}
              </button>
              
              <AnimatePresence>
                {isEvaluationExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2">
                      <div className="prose prose-sm max-w-none text-white prose-headings:text-white prose-headings:font-semibold prose-headings:mt-0 prose-p:my-1 prose-li:my-0 prose-strong:text-white/90">
                        <ReactMarkdown className={`whitespace-pre-wrap overflow-hidden`}>
                          {message.evaluation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons - Separate Section */}
          {!isUser && message.status === "success" && message.isLatestReply && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
              {/* Regenerate button */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-2 text-xs md:text-sm text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 w-fit"
                >
                  <IoRefresh className="w-4 h-4 md:w-5 md:h-5" />
                  Regenerate
                </button>
              )}

              {/* Rating stars */}
              {onRate && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs md:text-sm text-white/70">
                      Rate this response:
                    </span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setCurrentRating(rating);
                          onRate(rating);
                        }}
                        className={`transition-colors text-base md:text-lg ${
                          rating <= currentRating
                            ? "text-yellow-400"
                            : "text-white/40 hover:text-yellow-400"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Retry indicator */}
          {isUser && onRetry && message.status === "error" && (
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/30 backdrop-blur-lg border border-red-500/20 shadow-lg cursor-pointer"
              onClick={() => onRetry(message.message)}
            >
              <IoWarning className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
