import type { AuthRole } from './auth-role.type';

export type LoginLocalUser = {
  id: string;
  roles: AuthRole[];
  tokenVersion: number;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
};
