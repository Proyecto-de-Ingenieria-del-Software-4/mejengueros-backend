import {
  InvalidOrExpiredTokenError,
  UserNotFoundError,
} from '../../domain/exceptions/auth-domain.exceptions';
import type { VerifyEmailDependencies } from '../contracts';
import type { VerifyEmailCommand, VerifyEmailResult } from '../dto';

export class VerifyEmailUseCase {
  constructor(private readonly deps: VerifyEmailDependencies) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    const record = await this.deps.verificationTokenRepository.consumeValid({
      tokenHash: this.deps.tokenKeyManagement.fingerprint(command.token),
      now: this.deps.now(),
    });
    if (!record) throw new InvalidOrExpiredTokenError();

    const user = await this.deps.userRepository.findById(record.userId);
    if (!user) throw new UserNotFoundError();

    user.markEmailVerified();
    await this.deps.userRepository.save(user);
    return { verified: true };
  }
}
