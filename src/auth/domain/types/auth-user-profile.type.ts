import type { AuthRole } from '../auth.constants';

export type AuthUserProfile = {
  id: string;
  username: string;
  email: string;
  roles: AuthRole[];
  emailVerified: boolean;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockUntil: Date | null;
};
