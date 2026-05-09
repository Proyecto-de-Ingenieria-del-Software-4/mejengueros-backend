import { PasswordResetRequestedEvent } from '../../../shared/events/auth-domain.events';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { RequestPasswordResetUseCase } from './request-password-reset.use-case';

describe('RequestPasswordResetUseCase', () => {
  const build = (overrides?: {
    findByEmail?: (email: string) => Promise<AuthUser | null>;
  }) => {
    const issuePasswordReset = jest.fn(async () => undefined);
    const publish = jest.fn(async () => undefined);

    const useCase = new RequestPasswordResetUseCase({
      userRepository: {
        findByEmail:
          overrides?.findByEmail ??
          (async () =>
            createAuthUserStub({ id: 'user-1', email: 'player1@example.com' })),
      },
      passwordResetTokenRepository: {
        issue: issuePasswordReset,
      },
      tokenKeyManagement: {
        generateOpaqueToken: () => 'opaque-reset-token',
        fingerprint: (token: string) => `fp-${token}`,
      },
      eventBus: { publish },
    });

    return { useCase, issuePasswordReset, publish };
  };

  it('issues reset token and emits password reset event for known user', async () => {
    const { useCase, issuePasswordReset, publish } = build();

    await expect(
      useCase.execute({ email: 'Player1@Example.com ' }),
    ).resolves.toEqual({ accepted: true });

    expect(issuePasswordReset).toHaveBeenCalledWith({
      userId: 'user-1',
      tokenHash: 'fp-opaque-reset-token',
    });
    expect(publish).toHaveBeenCalledWith(
      expect.any(PasswordResetRequestedEvent),
    );
  });

  it('returns accepted and does not issue token for unknown user', async () => {
    const { useCase, issuePasswordReset, publish } = build({
      findByEmail: async () => null,
    });

    await expect(
      useCase.execute({ email: 'missing@example.com' }),
    ).resolves.toEqual({
      accepted: true,
    });

    expect(issuePasswordReset).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });
});
