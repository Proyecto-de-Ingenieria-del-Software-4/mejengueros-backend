import type { AuthRole } from '../../application/dto';

export type AuthUserContext = {
  userId: string;
  roles: AuthRole[];
  sessionId?: string;
};
