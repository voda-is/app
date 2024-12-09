import { QueryClient } from '@tanstack/react-query';
import { User } from './validations';

export type UserProfiles = Record<string, User>;

export class UserProfilesCache {
  private queryClient: QueryClient;
  private profiles: Record<string, User> = {};

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Check if a user exists in cache
  hasUser(userId: string): boolean {
    return !!this.profiles[userId];
  }

  // Add or update a single user in cache
  addUser(user: User) {
    this.profiles[user._id] = user;
    // Also update React Query cache
    this.queryClient.setQueryData(['userProfile', user._id], user);
  }

  // Add multiple users to cache
  addUsers(users: User[]) {
    users.forEach(user => this.addUser(user));
  }

  // Get a user from cache
  getUser(userId: string): User | undefined {
    return this.profiles[userId];
  }

  // Get all users from cache
  getAllUsers(): UserProfiles {
    return this.profiles;
  }

  // Clear cache
  clear() {
    this.profiles = {};
    this.queryClient.removeQueries({ queryKey: ['userProfile'] });
  }
}

// Create a singleton instance
let cacheInstance: UserProfilesCache | null = null;

export function initUserProfilesCache(queryClient: QueryClient) {
  cacheInstance = new UserProfilesCache(queryClient);
  return cacheInstance;
}

export function getUserProfilesCache() {
  if (!cacheInstance) {
    throw new Error('UserProfilesCache not initialized');
  }
  return cacheInstance;
} 