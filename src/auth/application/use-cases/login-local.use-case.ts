import {
  AccountLockedError,
  InvalidCredentialsError,
} from '../../domain/exceptions/auth-domain.exceptions';
import { InvalidAuthIdentifierError } from '../../domain/exceptions/auth-domain.exceptions';
import { LocalAuthIdentifier } from '../../domain/value-objects/local-auth-identifier.value-object';
import type { LoginLocalDependencies } from '../contracts/login-local.dependencies';
import type { LoginLocalCommand, LoginLocalResult } from '../dto';

export class LoginLocalUseCase {
  constructor(private readonly deps: LoginLocalDependencies) {}

  async execute(command: LoginLocalCommand): Promise<LoginLocalResult> {
    const identifier = this.parseIdentifier(command.identifier);
    const user = await this.deps.userRepository.findByUsername(identifier);
    if (!user) throw new InvalidCredentialsError();

    const now = this.deps.now();
    if (user.lockUntil && user.lockUntil.getTime() > now.getTime()) {
      throw new AccountLockedError();
    }

    const hash = await this.deps.credentialsRepository.findPasswordHashByUserId(
      user.id,
    );
    const isValidPassword = hash
      ? await this.deps.verifyPassword(command.password, hash)
      : false;

    if (!isValidPassword) {
      const attempts = user.failedLoginAttempts + 1;
      await this.deps.userRepository.save({
        ...user,
        failedLoginAttempts: attempts,
        lockUntil:
          attempts >= this.deps.lockoutThreshold
            ? new Date(now.getTime() + this.deps.lockoutDurationMs)
            : null,
      });
      throw new InvalidCredentialsError();
    }

    // TODO: Remover - Se comenta de momento la verificacion de email para permitir pruebas con cuentas sin verificar
    //if (!user.emailVerified) throw new EmailVerificationRequiredError();

    await this.deps.userRepository.save({
      ...user,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    return {
      tokens: await this.deps.tokenIssuer.issueForUser(
        user.id,
        user.tokenVersion,
      ),
      user: { id: user.id, roles: user.roles },
    };
  }

  private parseIdentifier(raw: string): string {
    try {
      return LocalAuthIdentifier.create(raw).value;
    } catch {
      throw new InvalidAuthIdentifierError(raw);
    }
  }
}
