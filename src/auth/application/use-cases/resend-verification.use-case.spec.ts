import { UserRegisteredEvent } from '../../../shared/events/auth-domain.events';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { ResendVerificationUseCase } from './resend-verification.use-case';

describe('ResendVerificationUseCase', () => {
  const now = new Date('2026-01-01T10:00:00.000Z');

  const build = (overrides?: {
    isOnCooldown?: () => Promise<boolean>;
    findByEmail?: () => Promise<AuthUser | null>;
  }) => {
    const mark = jest.fn(async () => undefined);
    const issue = jest.fn(async () => undefined);
    const publish = jest.fn(async () => undefined);

    const useCase = new ResendVerificationUseCase({
      userRepository: {
        findByEmail:
          overrides?.findByEmail ??
          (async () => createAuthUserStub({ emailVerified: false })),
      },
      verificationTokenRepository: {
        issue,
      },
      tokenKeyManagement: {
        generateOpaqueToken: () => 'opaque-token',
        fingerprint: (value: string) => `fp-${value}`,
      },
      throttleStore: {
        isOnCooldown: overrides?.isOnCooldown ?? (async () => false),
        mark,
      },
      eventBus: {
        publish,
      },
      now: () => now,
      resendCooldownMs: 60 * 1000,
    });

    return { useCase, issue, mark, publish };
  };

  it('issues a new token for unverified user and emits registration event', async () => {
    const { useCase, issue, mark, publish } = build();

    await expect(
      useCase.execute({ email: 'Player1@Example.com ' }),
    ).resolves.toEqual({ accepted: true });

    expect(mark).toHaveBeenCalledWith('player1@example.com', now);
    expect(issue).toHaveBeenCalledWith({
      userId: 'user-1',
      tokenHash: 'fp-opaque-token',
    });
    expect(publish).toHaveBeenCalledWith(expect.any(UserRegisteredEvent));
  });

  it('returns neutral response when request is on cooldown', async () => {
    const { useCase, issue } = build({ isOnCooldown: async () => true });

    await expect(
      useCase.execute({ email: 'player1@example.com' }),
    ).resolves.toEqual({ accepted: true });
    expect(issue).not.toHaveBeenCalled();
  });

  it('returns neutral response for unknown user or already verified user', async () => {
    const { useCase, issue } = build({ findByEmail: async () => null });

    await expect(
      useCase.execute({ email: 'ghost@example.com' }),
    ).resolves.toEqual({ accepted: true });
    expect(issue).not.toHaveBeenCalled();
  });
});
