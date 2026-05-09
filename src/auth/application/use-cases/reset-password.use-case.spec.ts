import {
  InvalidOrExpiredTokenError,
  PasswordPolicyFailedError,
  UserNotFoundError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { ResetPasswordUseCase } from './reset-password.use-case';

describe('ResetPasswordUseCase', () => {
  const now = new Date('2026-01-02T10:00:00.000Z');

  const build = (overrides?: {
    consumeValid?: () => Promise<{ userId: string } | null>;
    findById?: () => Promise<AuthUser | null>;
    validatePassword?: () => { valid: boolean; errors: string[] };
  }) => {
    const setPasswordHash = jest.fn(async () => undefined);
    const bumpTokenVersion = jest.fn(async () => undefined);

    const useCase = new ResetPasswordUseCase({
      passwordPolicyValidator: {
        validate:
          overrides?.validatePassword ?? (() => ({ valid: true, errors: [] })),
      },
      passwordResetTokenRepository: {
        consumeValid:
          overrides?.consumeValid ?? (async () => ({ userId: 'user-1' })),
      },
      userRepository: {
        findById:
          overrides?.findById ??
          (async () =>
            createAuthUserStub({ id: 'user-1', email: 'player1@example.com' })),
        bumpTokenVersion,
      },
      credentialsRepository: {
        setPasswordHash,
      },
      tokenKeyManagement: {
        fingerprint: (value: string) => `fp-${value}`,
      },
      passwordHasher: {
        hash: async (plain: string) => `hash-${plain}`,
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSymbol: true,
      },
      now: () => now,
    });

    return { useCase, setPasswordHash, bumpTokenVersion };
  };

  it('resets password and bumps token version when token is valid', async () => {
    const { useCase, setPasswordHash, bumpTokenVersion } = build();

    await expect(
      useCase.execute({ token: 'reset-token', newPassword: 'StrongPass123!' }),
    ).resolves.toBeUndefined();

    expect(setPasswordHash).toHaveBeenCalledWith(
      'user-1',
      'hash-StrongPass123!',
    );
    expect(bumpTokenVersion).toHaveBeenCalledWith('user-1');
  });

  it('fails when password policy is invalid', async () => {
    const { useCase } = build({
      validatePassword: () => ({ valid: false, errors: ['minLength'] }),
    });

    await expect(
      useCase.execute({ token: 'reset-token', newPassword: 'weak' }),
    ).rejects.toBeInstanceOf(PasswordPolicyFailedError);
  });

  it('fails when token is invalid or expired', async () => {
    const { useCase } = build({ consumeValid: async () => null });

    await expect(
      useCase.execute({ token: 'bad-token', newPassword: 'StrongPass123!' }),
    ).rejects.toBeInstanceOf(InvalidOrExpiredTokenError);
  });

  it('fails when token resolves to unknown user', async () => {
    const { useCase } = build({ findById: async () => null });

    await expect(
      useCase.execute({ token: 'reset-token', newPassword: 'StrongPass123!' }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
