import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getUserProfilesCache, UserProfiles } from '@/lib/userProfilesCache';
import { User } from '@/lib/validations';

export function useUserProfiles(userIds: string[]) {
  const cache = getUserProfilesCache();
  
  return {
    data: cache.getAllUsers(),
    isLoading: false,
  };
}

export function useUserProfile(userId: string) {
  const cache = getUserProfilesCache();
  
  return {
    data: cache.getUser(userId),
    isLoading: false,
  };
} 