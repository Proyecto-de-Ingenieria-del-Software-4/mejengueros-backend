import type { AuthRole } from './auth-role.type';

export type RegisterLocalResult = {
  user: {
    id: string;
    username: string;
    email: string;
    roles: AuthRole[];
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    refreshSessionId: string;
    refreshFamilyId: string;
  };
};
