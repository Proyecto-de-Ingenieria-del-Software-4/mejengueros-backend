import type { AuthRole } from '../domain/auth.constants';
import { AuthUser } from '../domain/entities/auth-user.entity';

type CreateAuthUserStubOverrides = {
  id?: string;
  username?: string;
  email?: string;
  role?: AuthRole;
  emailVerified?: boolean;
  tokenVersion?: number;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
};

export const createAuthUserStub = (
  overrides: CreateAuthUserStubOverrides = {},
): AuthUser =>
  AuthUser.create({
    id: overrides.id ?? 'user-1',
    username: overrides.username ?? 'player1',
    email: overrides.email ?? 'player1@example.com',
    role: overrides.role ?? 'USER',
    emailVerified: overrides.emailVerified ?? true,
    tokenVersion: overrides.tokenVersion ?? 0,
    failedLoginAttempts: overrides.failedLoginAttempts ?? 0,
    lockUntil: overrides.lockUntil ?? null,
  });
