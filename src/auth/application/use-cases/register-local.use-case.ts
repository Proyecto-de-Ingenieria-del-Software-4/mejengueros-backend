import { randomUUID } from 'node:crypto';
import {
  AuthDomainError,
  AuthInfrastructureError,
  EmailAlreadyExistsError,
  PasswordPolicyFailedError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions/auth-domain.exceptions';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { UserRegisteredEvent } from '../../../shared/events/auth-domain.events';
import type { RegisterLocalDependencies } from '../contracts';
import type { RegisterLocalCommand, RegisterLocalResult } from '../dto';

export class RegisterLocalUseCase {
  constructor(private readonly deps: RegisterLocalDependencies) {}

  private async executeInfrastructureStep<T>(
    operation: string,
    handler: () => Promise<T>,
  ): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof AuthInfrastructureError) {
        throw new AuthInfrastructureError({
          metadata: {
            ...error.metadata,
            useCase: 'register-local',
            useCaseOperation: operation,
          },
          cause: error.cause ?? error,
        });
      }

      if (error instanceof AuthDomainError) {
        throw error;
      }

      throw new AuthInfrastructureError({
        metadata: {
          source: 'auth/register',
          operation,
        },
        cause: error,
      });
    }
  }

  async execute(command: RegisterLocalCommand): Promise<RegisterLocalResult> {
    if (await this.deps.userRepository.findByUsername(command.username)) {
      throw new UsernameAlreadyExistsError();
    }
    if (await this.deps.userRepository.findByEmail(command.email)) {
      throw new EmailAlreadyExistsError();
    }

    const passwordValidation = this.deps.passwordPolicyValidator.validate(
      command.password,
      this.deps.passwordPolicy,
    );
    if (!passwordValidation.valid) throw new PasswordPolicyFailedError();

    const user = AuthUser.create({
      id: randomUUID(),
      username: command.username,
      email: command.email,
      roles: ['USER'],
      emailVerified: false,
      tokenVersion: 0,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    await this.executeInfrastructureStep('save-user', () =>
      this.deps.userRepository.save(user),
    );
    await this.executeInfrastructureStep('set-password-hash', async () =>
      this.deps.credentialsRepository.setPasswordHash(
        user.id,
        await this.deps.passwordHasher.hash(command.password),
      ),
    );

    const verificationToken =
      this.deps.tokenKeyManagement.generateOpaqueToken();
    await this.executeInfrastructureStep('issue-verification-token', () =>
      this.deps.verificationTokenRepository.issue({
        userId: user.id,
        tokenHash: this.deps.tokenKeyManagement.fingerprint(verificationToken),
      }),
    );

    await this.executeInfrastructureStep('publish-user-registered-event', () =>
      this.deps.eventBus.publish(
        new UserRegisteredEvent({
          userId: user.id,
          email: user.email,
          username: user.username,
        }),
      ),
    );

    const tokens = await this.executeInfrastructureStep(
      'issue-auth-tokens',
      () => this.deps.tokenIssuer.issueForUser(user.id, user.tokenVersion),
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }
}
