import { api } from "./api-client";
import { User } from "./validations";

export type UserProfiles = Record<string, User>;

export class UserProfilesCache {
  private getUsersFromLocalStorage = (): User[] => {
    try {
      const users = JSON.parse(localStorage.getItem("userProfiles") || "[]");
      return users;
    } catch {
      return [];
    }
  };

  async ensureUserProfiles(userIds: string[]) {
    const missingIds = userIds.filter((id) => !this.hasUser(id));
    if (missingIds.length > 0) {
      const users = await api.user.getUsers(missingIds);
      this.addUsers(users);
    }
    return this.getAllUsers();
  }

  hasUser(userId: string): boolean {
    const users = this.getUsersFromLocalStorage();
    const hasUser = users.find((user) => user._id === userId);
    return !!hasUser;
  }

  addUser(user: User) {
    const usersLocal = this.getUsersFromLocalStorage();
    usersLocal.push(user);
    localStorage.setItem("userProfiles", JSON.stringify(usersLocal));
  }

  addUsers(users: User[]) {
    const usersLocal = this.getUsersFromLocalStorage();
    usersLocal.push(...users);
    localStorage.setItem("userProfiles", JSON.stringify(usersLocal));
  }

  getUser(userId: string): User | undefined {
    const users = this.getUsersFromLocalStorage();
    const user = users.find((user) => user._id === userId);
    return user;
  }

  getAllUsers(): User[] {
    const users = this.getUsersFromLocalStorage();
    return users;
  }

  clear() {
    localStorage.removeItem("userProfiles");
  }
}
