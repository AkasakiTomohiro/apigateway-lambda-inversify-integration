export type UserType = {
  userId: string;
  role: Role;
};

const roleList = ['admin', 'user'] as const;
type Role = typeof roleList[number];
