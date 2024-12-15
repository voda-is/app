import { motion, useAnimationControls } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface ProgressBarButtonProps {
  isActive: boolean;
  duration: number;
  progress: number;
  onComplete?: () => void;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function ProgressBarButton({
  isActive,
  duration,
  progress,
  onComplete,
  onClick,
  children,
  className = "",
}: ProgressBarButtonProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (isActive) {
      controls.start({
        width: "100%",
        transition: {
          duration: duration - progress,
          ease: "linear",
          type: "tween",
        },
      });
    } else {
      controls.stop();
      controls.set({ width: `${(progress / duration) * 100}%` });
    }
  }, [isActive, duration, progress, controls]);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg 
        bg-white/20 active:scale-95
        text-white/80 hover:text-white 
        transition-all duration-200 overflow-hidden
        ${className}`}
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 bg-white/30"
        initial={{ width: 0 }}
        animate={controls}
        onAnimationComplete={() => onComplete?.()}
      />
      <div className="relative flex items-center gap-2">
        {children}
      </div>
    </button>
  );
} 