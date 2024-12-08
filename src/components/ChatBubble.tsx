"use client";

import { motion, useAnimationControls } from "framer-motion";
import { IoRefresh, IoWarning } from "react-icons/io5";
import { GiSoundWaves } from "react-icons/gi";
import { ChatHistoryPair, HistoryMessage, TTSEntry } from "@/lib/validations";
import { FormattedText } from "@/components/FormattedText";
import { useState, useMemo, useEffect } from "react";
import { useTTS } from "@/hooks/api";
import { extractText } from "@/lib/formatText";
import { hashText } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ChatBubbleProps  {
  message: string,
  role: "user" | "assistant",
  created_at: number,
  status: "sent" | "error",

  isLatestReply?: boolean;
  onRetry?: (text: string) => void;
  onRegenerate?: () => void;
  onRate?: (rating: number) => void;
  enableVoice?: boolean;
  characterId: string;
}

export function ChatBubble({
  message,
  role,
  created_at,
  isLatestReply,
  onRetry,
  onRegenerate,
  onRate,
  status = "sent",
  enableVoice = false,
  characterId,
}: ChatBubbleProps) {
  if (!message) return null;

  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const timestamp = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine bubble style based on role
  const getBubbleStyle = () => {
    if (isUser) return "bg-[#10B981] text-black";
    if (isAssistant)
      return "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white";
    return "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg text-white"; // default style
  };

  // State to track the current rating
  const [currentRating, setCurrentRating] = useState(0);

  const { mutate: generateTTS, isPending: isTTSLoading } = useTTS();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Extract text once and memoize it
  const ttsText = useMemo(() => extractText(message).join(" "), [message]);

  // Calculate hash when text changes
  useEffect(() => {
    hashText(ttsText).then(setHash);
  }, [ttsText]);

  // Get cached result
  const { data: cachedTTS } = useQuery<TTSEntry>({
    queryKey: ["tts", hash],
    enabled: !!hash,
    staleTime: Infinity,
  });

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
      { text: ttsText, characterId },
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

  const controls = useAnimationControls();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`flex items-center gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Retry indicator - only show for failed user messages */}
      {isUser && onRetry && status === "error" && (
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/30 backdrop-blur-lg border border-red-500/20 shadow-lg cursor-pointer"
          onClick={() => onRetry(message)}
        >
          <IoWarning className="w-5 h-5 text-white" />
        </motion.div>
      )}

      <div className={`max-w-[90%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-2 text-sm ${getBubbleStyle()}`}>
          {/* Message content */}
          <div className="mb-2">
            {!isUser && enableVoice && !audioBlob && (
              <button
                onClick={handleTTSClick}
                disabled={isTTSLoading}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg 
                  ${
                    isTTSLoading
                      ? "bg-white/5 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20 active:scale-95"
                  }
                  text-white/80 hover:text-white 
                  transition-all duration-200 
                  mb-3
                `}
              >
                <GiSoundWaves className="w-5 h-5" />
                <span className="text-sm font-medium">
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
                  onPlay={() => {
                    setIsPlaying(true);
                    controls.start({
                      width: "100%",
                      transition: {
                        duration: duration - currentTime,
                        ease: "linear",
                        type: "tween",
                      },
                    });
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    controls.stop();
                    controls.set({
                      width: `${(currentTime / duration) * 100}%`,
                    });
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    controls.stop();
                    controls.set({ width: 0 });
                  }}
                  onTimeUpdate={() => {
                    if (audioElement) {
                      setCurrentTime(audioElement.currentTime);
                    }
                  }}
                />

                <button
                  onClick={() => {
                    if (audioElement) {
                      if (isPlaying) {
                        audioElement.pause();
                      } else {
                        if (audioElement.ended) {
                          audioElement.currentTime = 0;
                          controls.set({ width: 0 });
                        }
                        audioElement.play().catch((error) => {
                          console.error("Error playing audio:", error);
                        });
                      }
                    }
                  }}
                  className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg 
                    bg-white/10 hover:bg-white/20 active:scale-95
                    text-white/80 hover:text-white 
                    transition-all duration-200 overflow-hidden"
                >
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-white/10"
                    initial={{ width: 0 }}
                    animate={controls}
                  />

                  <div className="relative flex items-center gap-2">
                    <GiSoundWaves
                      className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`}
                    />
                    <span className="text-sm font-medium">
                      {isPlaying ? "Playing..." : "Play Audio"}
                    </span>
                    <span className="text-xs text-white/60">
                      {Math.ceil(duration)}"
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Rest of the message content */}
            <div
              className={`${
                enableVoice
                  ? "border-t border-white/10 pt-4"
                  : isUser
                  ? "pt-4"
                  : ""
              }`}
            >
              {message && <FormattedText text={message} skipFormatting={isUser} />}
            </div>
          </div>

          {/* Timestamp and controls container */}
          <div className="border-t border-white/10 mt-2 pt-2">
            {/* Timestamp */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${
                  isUser ? "text-black/70" : "text-white/70"
                }`}
              >
                {timestamp}
              </span>
            </div>

            {/* Controls for assistant messages */}
            {isLatestReply && !isUser && (
              <div className="flex flex-col gap-2 mt-2">
                {/* Regenerate button */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <IoRefresh className="w-4 h-4" />
                    Regenerate
                  </button>
                )}

                {/* Rating stars with text */}
                {onRate && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">
                        Rate this response:
                      </span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setCurrentRating(rating);
                            onRate(rating);
                          }}
                          className={`transition-colors ${
                            rating <= currentRating
                              ? "text-yellow-400"
                              : "text-gray-400 hover:text-yellow-400"
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
