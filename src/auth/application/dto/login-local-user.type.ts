import type { AuthRole } from './auth-role.type';

export type LoginLocalUser = {
  id: string;
  role: AuthRole;
  tokenVersion: number;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
};
