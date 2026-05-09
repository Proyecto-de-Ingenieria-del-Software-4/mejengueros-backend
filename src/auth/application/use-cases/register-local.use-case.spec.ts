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
    saveUserImpl?: () => Promise<void>;
    setPasswordHashImpl?: () => Promise<void>;
    issueVerificationTokenImpl?: () => Promise<void>;
    publishImpl?: () => Promise<void>;
    issueTokensImpl?: () => Promise<{
      accessToken: string;
      refreshToken: string;
      refreshSessionId: string;
      refreshFamilyId: string;
    }>;
  }) => {
    const saveUser = jest.fn(
      overrides?.saveUserImpl ?? (async () => undefined),
    );
    const setPasswordHash = jest.fn(
      overrides?.setPasswordHashImpl ?? (async () => undefined),
    );
    const issueVerificationToken = jest.fn(
      overrides?.issueVerificationTokenImpl ?? (async () => undefined),
    );
    const publish = jest.fn(overrides?.publishImpl ?? (async () => undefined));

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
        issueForUser:
          overrides?.issueTokensImpl ??
          (async () => ({
            accessToken: 'a1',
            refreshToken: 'r1',
            refreshSessionId: 's1',
            refreshFamilyId: 'f1',
          })),
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
      username: 'newbie',
      email: 'newbie@example.com',
      password: 'StrongPass123!',
    });

    expect(result.user.username).toBe('newbie');
    expect(result.user.email).toBe('newbie@example.com');
    expect(result.user.roles).toEqual(['USER']);
    expect(result.user.emailVerified).toBe(false);
    expect(result.user.id).toEqual(expect.any(String));
    expect(saveUser).toHaveBeenCalledTimes(1);
    const savedUser = (
      saveUser.mock.calls as Array<Array<{ id: string }>>
    )[0]?.[0];
    expect(savedUser).toBeDefined();
    expect(setPasswordHash).toHaveBeenCalledWith(
      savedUser.id,
      'hash-StrongPass123!',
    );
    expect(issueVerificationToken).toHaveBeenCalledWith({
      userId: savedUser.id,
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
        username: 'newbie',
        email: 'newbie@example.com',
        password: 'weak',
      }),
    ).rejects.toBeInstanceOf(PasswordPolicyFailedError);
  });

  it('wraps unexpected infrastructure failure with operation metadata', async () => {
    const { useCase } = build({
      setPasswordHashImpl: async () => {
        throw new Error('hash service timeout');
      },
    });

    await expect(
      useCase.execute({
        username: 'newbie',
        email: 'newbie@example.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toMatchObject({
      code: 'auth/service-unavailable',
      metadata: {
        source: 'auth/register',
        operation: 'set-password-hash',
      },
    });
  });
});
