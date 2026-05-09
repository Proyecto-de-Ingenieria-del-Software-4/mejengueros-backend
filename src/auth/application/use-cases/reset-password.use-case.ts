import {
  InvalidOrExpiredTokenError,
  PasswordPolicyFailedError,
  UserNotFoundError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { ResetPasswordDependencies } from '../contracts';
import type { ResetPasswordCommand } from '../dto';

export class ResetPasswordUseCase {
  constructor(private readonly deps: ResetPasswordDependencies) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const passwordValidation = this.deps.passwordPolicyValidator.validate(
      command.newPassword,
      this.deps.passwordPolicy,
    );
    if (!passwordValidation.valid) throw new PasswordPolicyFailedError();

    const record = await this.deps.passwordResetTokenRepository.consumeValid({
      tokenHash: this.deps.tokenKeyManagement.fingerprint(command.token),
      now: this.deps.now(),
    });
    if (!record) throw new InvalidOrExpiredTokenError();

    const user = await this.deps.userRepository.findById(record.userId);
    if (!user) throw new UserNotFoundError();

    await this.deps.credentialsRepository.setPasswordHash(
      user.id,
      await this.deps.passwordHasher.hash(command.newPassword),
    );
    await this.deps.userRepository.bumpTokenVersion(user.id);
  }
}
