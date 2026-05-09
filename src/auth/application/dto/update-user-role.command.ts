import type { AuthRole } from './auth-role.type';

export type UpdateUserRoleCommand = {
  actorUserId: string;
  targetUserId: string;
  role: AuthRole;
};
