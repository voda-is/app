import Image from "next/image";
import { User } from "@/lib/validations";
import { getUserProfilesCache } from "@/lib/userProfilesCache";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type Props = {
  isExpanded: boolean;
  onClose: () => void;
  currentUserIds: string[];
  userOnStageId?: string;
};

export function UsersExpandedView({ 
  isExpanded, 
  onClose,
  currentUserIds,
  userOnStageId 
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const cache = getUserProfilesCache();
  const [userProfiles, setUserProfiles] = useState<Record<string, User>>(cache.getAllUsers());

  useEffect(() => {
    const loadMissingProfiles = async () => {
      if (!currentUserIds.length) return;

      const missingIds = currentUserIds.filter(id => !cache.hasUser(id));
      if (missingIds.length === 0) return;

      setIsLoading(true);
      try {
        const users = await api.user.getUsers(missingIds);
        users.forEach(user => cache.addUser(user));
        setUserProfiles(cache.getAllUsers());
      } catch (error) {
        console.error('Failed to load user profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMissingProfiles();
  }, [currentUserIds, isExpanded]); // Only run when currentUserIds changes or component is expanded

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isExpanded 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md rounded-t-3xl p-6 transition-transform duration-300 ease-out ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-1 bg-white/20 rounded-full mb-6" />
          
          <div className="flex justify-between items-center w-full mb-6">
            <h3 className="text-white text-lg font-medium">
              {isLoading ? 'Loading Users...' : `Online Users (${currentUserIds.length})`}
            </h3>
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 w-full max-h-[60vh] overflow-y-auto p-4">
            {currentUserIds.map((userId) => {
              const user = userProfiles[userId];
              if (!user) {
                return (
                  <div 
                    key={userId}
                    className="flex flex-col items-center space-y-2 animate-pulse"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10" />
                    <div className="w-16 h-4 rounded bg-white/10" />
                  </div>
                );
              }
              
              return (
                <div 
                  key={userId}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                    <Image
                      src={user.profile_photo || '/default-avatar.png'}
                      alt={user.first_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    {userId === userOnStageId && (
                      <div className="absolute inset-0 ring-2 ring-pink-500 ring-offset-2 ring-offset-black/90 rounded-full" />
                    )}
                  </div>
                  <span className="text-white/90 text-sm text-center font-medium truncate max-w-full px-2">
                    {user.first_name}
                  </span>
                  {userId === userOnStageId && (
                    <span className="text-xs text-pink-500">Speaking</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 