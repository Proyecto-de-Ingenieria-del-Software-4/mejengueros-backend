import {
  EmailAlreadyExistsError,
  PasswordPolicyFailedError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { AuthUser } from '../../domain/entities/auth-user.entity';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';
import { UserRegisteredEvent } from '../../../shared/events/auth-domain.events';
import { RegisterLocalUseCase } from './register-local.use-case';

describe('RegisterLocalUseCase', () => {
  const build = (overrides?: {
    findByUsername?: (username: string) => Promise<AuthUser | null>;
    findByEmail?: (email: string) => Promise<AuthUser | null>;
    validatePassword?: () => { valid: boolean; errors: string[] };
  }) => {
    const saveUser = jest.fn(async () => undefined);
    const setPasswordHash = jest.fn(async () => undefined);
    const issueVerificationToken = jest.fn(async () => undefined);
    const publish = jest.fn(async () => undefined);

    const useCase = new RegisterLocalUseCase({
      userRepository: {
        findByUsername: overrides?.findByUsername ?? (async () => null),
        findByEmail: overrides?.findByEmail ?? (async () => null),
        save: saveUser,
      },
      credentialsRepository: {
        setPasswordHash,
      },
      verificationTokenRepository: {
        issue: issueVerificationToken,
      },
      tokenIssuer: {
        issueForUser: async () => ({
          accessToken: 'a1',
          refreshToken: 'r1',
          refreshSessionId: 's1',
          refreshFamilyId: 'f1',
        }),
      },
      passwordHasher: {
        hash: async (plain: string) => `hash-${plain}`,
      },
      passwordPolicyValidator: {
        validate:
          overrides?.validatePassword ?? (() => ({ valid: true, errors: [] })),
      },
      tokenKeyManagement: {
        generateOpaqueToken: () => 'opaque-token',
        fingerprint: (value: string) => `fp-${value}`,
      },
      eventBus: {
        publish,
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSymbol: true,
      },
    });

    return {
      useCase,
      saveUser,
      setPasswordHash,
      issueVerificationToken,
      publish,
    };
  };

  it('registers local user and emits registration event', async () => {
    const {
      useCase,
      saveUser,
      setPasswordHash,
      issueVerificationToken,
      publish,
    } = build();

    const result = await useCase.execute({
      id: 'user-2',
      username: 'newbie',
      email: 'newbie@example.com',
      password: 'StrongPass123!',
    });

    expect(result.user).toEqual({
      id: 'user-2',
      username: 'newbie',
      email: 'newbie@example.com',
      role: 'USER',
      emailVerified: false,
    });
    expect(saveUser).toHaveBeenCalledTimes(1);
    expect(setPasswordHash).toHaveBeenCalledWith(
      'user-2',
      'hash-StrongPass123!',
    );
    expect(issueVerificationToken).toHaveBeenCalledWith({
      userId: 'user-2',
      tokenHash: 'fp-opaque-token',
    });
    expect(publish).toHaveBeenCalledWith(expect.any(UserRegisteredEvent));
  });

  it('fails when username already exists', async () => {
    const { useCase } = build({
      findByUsername: async () => createAuthUserStub({ id: 'existing' }),
    });

    await expect(
      useCase.execute({
        id: 'user-2',
        username: 'player1',
        email: 'newbie@example.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
  });

  it('fails when email already exists', async () => {
    const { useCase } = build({
      findByEmail: async () => createAuthUserStub({ id: 'existing' }),
    });

    await expect(
      useCase.execute({
        id: 'user-2',
        username: 'newbie',
        email: 'player1@example.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('fails when password policy does not pass', async () => {
    const { useCase } = build({
      validatePassword: () => ({ valid: false, errors: ['minLength'] }),
    });

    await expect(
      useCase.execute({
        id: 'user-2',
        username: 'newbie',
        email: 'newbie@example.com',
        password: 'weak',
      }),
    ).rejects.toBeInstanceOf(PasswordPolicyFailedError);
  });
});
