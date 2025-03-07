import { User } from "@/lib/validations";
import Image from "next/image";
import { FiAward, FiShare2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface ChatroomHeaderProps {
  variant?: 'chat' | 'chatroom' | 'message';

  name: string;
  image: string;
  className?: string;
  onPointsClick: () => void;
  points: number;
  canClaim: boolean;

  messageId?: string;
  chatroomId?: string;
  userCount?: number;
  recentUsers?: User[];
  onUsersClick?: () => void;

  showToast?: (message: string) => void;
  characterId?: string;
}

export function Header({ 
  variant = 'chat',
  name, 
  image, 
  messageId,
  chatroomId,
  userCount, 
  recentUsers,
  className = "",
  onUsersClick,
  onPointsClick,
  points,
  canClaim,
  showToast,
  characterId
}: ChatroomHeaderProps) {
  const router = useRouter();

  const handleShare = async () => {
    // Generate the deep link
    const path = `/chatroomMessage/${chatroomId}/${messageId}`;
    // const shareLink = await generateTelegramAppLink("voda_is_bot", path, "chatroom_message");
    
    // try {
    //   await navigator.clipboard.writeText(shareLink);
    //   showToast?.("Link copied to clipboard!");
    // } catch (err) {
    //   showToast?.("Failed to copy link!");
    // }
  };

  return (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      {/* Character info - centered at top, with mobile-friendly button styling */}
      <button 
        onClick={() => characterId && router.push(`/character/${characterId}`)}
        className="w-full group transition-all active:scale-98 hover:bg-white/5 py-3"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover rounded-full ring-2 ring-emerald-300/30 group-hover:ring-emerald-300/50 transition-all"
            />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gray-600/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-4 h-4 text-emerald-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
          <span className="text-white font-medium text-xl group-hover:text-emerald-300 transition-colors">
            {name}
          </span>
        </div>
      </button>

      {/* Bottom section with buttons */}
      <div className="flex items-end justify-between px-4 py-3">
        {/* Online Users */}
        {variant === 'chatroom' && (<button 
            onClick={onUsersClick}
            className="h-9 flex items-center bg-emerald-300/20 rounded-lg px-3"
          >
            <div className="flex -space-x-2 mr-3">
            {recentUsers?.map((user) => (
              <div 
                key={user._id} 
                className="relative w-6 h-6 rounded-full border-2 border-black/50 backdrop-blur-sm"
              >
                <Image
                  src={user.profile_photo || "/bg2.png"}
                  alt={user.first_name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1" />
            <span className="text-white/80 text-sm">{userCount} online</span>
          </div>
          </button>)}

        {/* Share button for message variant */}
        {variant === 'message' && (
          <button
            onClick={handleShare}
            className="h-9 flex items-center bg-emerald-300/20 rounded-lg px-3 gap-2"
          >
            <FiShare2 className="text-white/90 text-lg" />
            <span className="text-white/90 text-sm">Share</span>
          </button>
        )}

        {/* Points Display with Status */}
        <div className="relative">
          <div className="absolute -top-4 left-0 right-0 text-center text-white/60 text-xs whitespace-nowrap">
            {canClaim ? 'Free points available!' : ''}
          </div>
          <button 
            onClick={onPointsClick}
            className="h-9 flex items-center bg-emerald-300/20 rounded-lg px-3 min-w-[120px]"
          >
            <FiAward className="text-white/90 text-lg mr-2" />
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <span className="text-white/90 text-sm font-medium mr-1">
                  {points}
                </span>
                <span className="text-white/60 text-sm">
                  Points
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
