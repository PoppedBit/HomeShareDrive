export type User = {
  id: number;
  username: string;
  originalUsername: string;
  email: string;
  isEmailVerified: boolean;
  lastLoginDate: Date;
  lastActiveDate: Date;
  isAdmin: boolean;
  isBanned: boolean;
  unBanDate: Date;
  banReason: string;
  nameColor: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
};
