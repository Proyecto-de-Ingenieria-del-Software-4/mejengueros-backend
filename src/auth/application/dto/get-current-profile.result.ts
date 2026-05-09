import type { AuthRole } from './auth-role.type';

export type GetCurrentProfileResult = {
  id: string;
  username: string;
  email: string;
  role: AuthRole;
  emailVerified: boolean;
};
