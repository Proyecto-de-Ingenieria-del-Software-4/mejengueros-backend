import { PasswordResetRequestedEvent } from '../../../shared/events/auth-domain.events';
import type { RequestPasswordResetDependencies } from '../contracts';
import type {
  RequestPasswordResetCommand,
  RequestPasswordResetResult,
} from '../dto';

export class RequestPasswordResetUseCase {
  constructor(private readonly deps: RequestPasswordResetDependencies) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    const normalizedEmail = command.email.trim().toLowerCase();
    const user = await this.deps.userRepository.findByEmail(normalizedEmail);
    if (!user) return { accepted: true };

    const resetToken = this.deps.tokenKeyManagement.generateOpaqueToken();
    await this.deps.passwordResetTokenRepository.issue({
      userId: user.id,
      tokenHash: this.deps.tokenKeyManagement.fingerprint(resetToken),
    });

    await this.deps.eventBus.publish(
      new PasswordResetRequestedEvent({
        userId: user.id,
        email: user.email,
        resetToken,
      }),
    );

    return { accepted: true };
  }
}
