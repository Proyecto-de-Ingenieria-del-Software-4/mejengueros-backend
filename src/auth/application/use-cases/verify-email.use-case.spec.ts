import {
  InvalidOrExpiredTokenError,
  UserNotFoundError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { VerifyEmailUseCase } from './verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  const build = (overrides?: {
    consumeValid?: () => Promise<{ userId: string } | null>;
    findById?: () => Promise<AuthUser | null>;
  }) => {
    const save = jest.fn(async () => undefined);
    const useCase = new VerifyEmailUseCase({
      verificationTokenRepository: {
        consumeValid:
          overrides?.consumeValid ?? (async () => ({ userId: 'user-1' })),
      },
      userRepository: {
        findById:
          overrides?.findById ??
          (async () => createAuthUserStub({ emailVerified: false })),
        save,
      },
      tokenKeyManagement: {
        fingerprint: (value: string) => `fp-${value}`,
      },
      now: () => new Date('2026-01-01T10:00:00.000Z'),
    });

    return { useCase, save };
  };

  it('consumes verification token and marks user as verified', async () => {
    const { useCase, save } = build();

    await expect(useCase.execute({ token: 'verify-1' })).resolves.toEqual({
      verified: true,
    });
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        emailVerified: true,
      }),
    );
  });

  it('fails when token is invalid or expired', async () => {
    const { useCase } = build({ consumeValid: async () => null });

    await expect(useCase.execute({ token: 'invalid' })).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });

  it('fails when token points to unknown user', async () => {
    const { useCase } = build({ findById: async () => null });

    await expect(useCase.execute({ token: 'verify-1' })).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });
});
