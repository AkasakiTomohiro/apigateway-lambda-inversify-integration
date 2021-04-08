export type UserType = {
  userId: string;
  role: Role;
};

export const roleList = ['admin', 'user'] as const;
export type Role = typeof roleList[number];
