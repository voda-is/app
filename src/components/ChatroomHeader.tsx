import Image from "next/image";

interface User {
  id: string;
  avatar_url: string;
  name: string;
}

interface ChatroomHeaderProps {
  name: string;
  image: string;
  userCount: number;
  recentUsers: User[];
  latestJoinedUser?: string;
  className?: string;
  onUsersClick: () => void;
}

export function ChatroomHeader({ 
  name, 
  image, 
  userCount, 
  recentUsers,
  latestJoinedUser,
  className = "",
  onUsersClick
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

      {/* Users info - bottom left */}
      <div className="flex justify-between items-end px-4 pb-3">
        <button 
          onClick={onUsersClick}
          className="flex items-center space-x-3 hover:bg-white/10 rounded-xl p-2 transition-colors"
        >
          <div className="flex -space-x-2">
            {recentUsers.map((user) => (
              <div 
                key={user.id} 
                className="relative w-6 h-6 rounded-full border-2 border-black/50 backdrop-blur-sm"
              >
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">{userCount} online</span>
          </div>
        </button>

        {latestJoinedUser && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-white/90 text-sm">
              {latestJoinedUser} just joined
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
