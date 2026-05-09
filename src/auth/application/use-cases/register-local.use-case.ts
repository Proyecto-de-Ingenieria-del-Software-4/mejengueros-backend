import {
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
      id: command.id,
      username: command.username,
      email: command.email,
      role: 'USER',
      emailVerified: false,
      tokenVersion: 0,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    await this.deps.userRepository.save(user);
    await this.deps.credentialsRepository.setPasswordHash(
      user.id,
      await this.deps.passwordHasher.hash(command.password),
    );

    const verificationToken =
      this.deps.tokenKeyManagement.generateOpaqueToken();
    await this.deps.verificationTokenRepository.issue({
      userId: user.id,
      tokenHash: this.deps.tokenKeyManagement.fingerprint(verificationToken),
    });

    await this.deps.eventBus.publish(
      new UserRegisteredEvent({
        userId: user.id,
        email: user.email,
        username: user.username,
      }),
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      tokens: await this.deps.tokenIssuer.issueForUser(
        user.id,
        user.tokenVersion,
      ),
    };
  }
}
