import {
  AccountLockedError,
  EmailVerificationRequiredError,
  InvalidCredentialsError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { CredentialsRepository } from '../../domain/repositories/credentials.repository';
import type { TokenIssuer } from '../../domain/services/token-issuer.service';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { LoginLocalUseCase } from './login-local.use-case';

describe('LoginLocalUseCase', () => {
  const now = new Date('2026-01-01T10:00:00.000Z');

  const build = (overrides?: {
    userRepository?: Partial<UserRepository>;
    credentialsRepository?: Partial<CredentialsRepository>;
    tokenIssuer?: Partial<TokenIssuer>;
    verifyPassword?: (plain: string, hash: string) => Promise<boolean>;
  }) => {
    const savedUsers: Array<{
      failedLoginAttempts: number;
      lockUntil: Date | null;
    }> = [];

    const userRepository: UserRepository = {
      findById: async () => null,
      findByUsername: async () => createAuthUserStub(),
      findByEmail: async () => null,
      save: async (user) => {
        savedUsers.push({
          failedLoginAttempts: user.failedLoginAttempts,
          lockUntil: user.lockUntil,
        });
      },
      updateRole: async () => undefined,
      bumpTokenVersion: async () => undefined,
      ...overrides?.userRepository,
    };

    const credentialsRepository: CredentialsRepository = {
      findPasswordHashByUserId: async () => 'hash-Valid123!',
      setPasswordHash: async () => undefined,
      ...overrides?.credentialsRepository,
    };

    const tokenIssuer: TokenIssuer = {
      issueForUser: async () => ({
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      }),
      rotateRefreshToken: async () => ({
        accessToken: 'a2',
        refreshToken: 'r2',
        refreshSessionId: 's2',
        refreshFamilyId: 'f2',
      }),
      ...overrides?.tokenIssuer,
    };

    const useCase = new LoginLocalUseCase({
      userRepository,
      credentialsRepository,
      tokenIssuer,
      now: () => now,
      lockoutThreshold: 3,
      lockoutDurationMs: 10 * 60 * 1000,
      verifyPassword:
        overrides?.verifyPassword ??
        (async (plain: string, hash: string) => hash === `hash-${plain}`),
    });

    return { useCase, savedUsers };
  };

  it('returns tokens and user id/role when credentials are valid', async () => {
    const { useCase, savedUsers } = build();

    const result = await useCase.execute({
      identifier: 'player1',
      password: 'Valid123!',
    });

    expect(result.user).toEqual({ id: 'user-1', role: 'USER' });
    expect(result.tokens.refreshToken).toBe('r1');
    expect(savedUsers).toEqual([{ failedLoginAttempts: 0, lockUntil: null }]);
  });

  it('throws invalid credentials and increments attempts for invalid password', async () => {
    const { useCase, savedUsers } = build({
      verifyPassword: async () => false,
    });

    await expect(
      useCase.execute({ identifier: 'player1', password: 'wrong' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(savedUsers[0]?.failedLoginAttempts).toBe(1);
  });

  it('throws account locked when lockUntil is in future', async () => {
    const { useCase } = build({
      userRepository: {
        findByUsername: async () =>
          createAuthUserStub({
            failedLoginAttempts: 2,
            lockUntil: new Date('2026-01-01T10:15:00.000Z'),
          }),
      },
    });

    await expect(
      useCase.execute({ identifier: 'player1', password: 'Valid123!' }),
    ).rejects.toBeInstanceOf(AccountLockedError);
  });

  it('throws email verification required for unverified users', async () => {
    const { useCase } = build({
      userRepository: {
        findByUsername: async () =>
          createAuthUserStub({ emailVerified: false }),
      },
    });

    await expect(
      useCase.execute({ identifier: 'player1', password: 'Valid123!' }),
    ).rejects.toBeInstanceOf(EmailVerificationRequiredError);
  });
});
