import { User } from "@/lib/validations";
import Image from "next/image";
import { FiAward } from "react-icons/fi";

interface ChatroomHeaderProps {
  name: string;
  image: string;
  userCount: number;
  recentUsers: User[];
  className?: string;
  onUsersClick: () => void;
  onPointsClick: () => void;
  points: number;
  canClaim: boolean;
  timeLeft: string;
}

export function ChatroomHeader({ 
  name, 
  image, 
  userCount, 
  recentUsers,
  className = "",
  onUsersClick,
  onPointsClick,
  points,
  canClaim,
  timeLeft,
}: ChatroomHeaderProps) {
  return (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      {/* Character info - centered at top */}
      <div className="flex items-center justify-center space-x-3 pt-4">
        <div className="relative w-10 h-10">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover rounded-full"
          />
        </div>
        <span className="text-white font-medium text-xl">{name}</span>
      </div>

      {/* Bottom section with buttons */}
      <div className="flex items-end justify-between px-4 py-3">
        {/* Online Users */}
        <button 
          onClick={onUsersClick}
          className="h-9 flex items-center bg-emerald-300/20 rounded-lg px-3"
        >
          <div className="flex -space-x-2 mr-3">
            {recentUsers.map((user) => (
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
        </button>

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
