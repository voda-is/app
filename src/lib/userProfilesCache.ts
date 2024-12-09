import { User } from "./validations";

export type UserProfiles = Record<string, User>;

export class UserProfilesCache {
  private getUsersFromLocalStorage = (): User[] => {
    try {
      const users = JSON.parse(localStorage.getItem("userProfiles") || "[]");
      console.log(".....getUsersFromLocalStorage", users);
      return users;
    } catch {
      return []; // 返回空数组以防止解析错误
    }
  };

  hasUser(userId: string): boolean {
    const users = this.getUsersFromLocalStorage();
    const hasUser = users.find((user) => user._id === userId);
    console.log(".....hasUser", !!hasUser);
    return !!hasUser;
  }

  addUser(user: User) {
    const usersLocal = this.getUsersFromLocalStorage();
    usersLocal.push(user);
    console.log(".....addUser", usersLocal);
    localStorage.setItem("userProfiles", JSON.stringify(usersLocal));
  }

  addUsers(users: User[]) {
    const usersLocal = this.getUsersFromLocalStorage();
    usersLocal.push(...users);
    console.log(".....addUsers", usersLocal);
    localStorage.setItem("userProfiles", JSON.stringify(usersLocal));
  }

  getUser(userId: string): User | undefined {
    const users = this.getUsersFromLocalStorage();
    const user = users.find((user) => user._id === userId);
    console.log(".....getUser", user);
    return user;
  }
  /**
   * 获取所有用户
   * @returns
   *
   */
  getAllUsers(): User[] {
    const users = this.getUsersFromLocalStorage();
    console.log(".....getAllUsers", users);
    return users;
  }

  clear() {
    localStorage.removeItem("userProfiles");
  }
}
