import type { AuthUserProfile } from '../../domain/types/auth-user-profile.type';

export type PrismaUserRecord = {
  id: string;
  username: string;
  email: string;
  userRole: {
    role: {
      code: 'USER' | 'ADMIN';
    };
  } | null;
  emailVerified: boolean;
  tokenVersion: number;
  failedLoginCount: number;
  lockoutUntil: Date | null;
};

export function toAuthUserProfile(record: PrismaUserRecord): AuthUserProfile {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    role: record.userRole?.role.code ?? 'USER',
    emailVerified: record.emailVerified,
    tokenVersion: record.tokenVersion,
    failedLoginAttempts: record.failedLoginCount,
    lockUntil: record.lockoutUntil,
  };
}
