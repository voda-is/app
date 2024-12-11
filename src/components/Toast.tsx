import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-20 left-1/2 z-30"
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-lg text-white/90 text-sm shadow-lg">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 