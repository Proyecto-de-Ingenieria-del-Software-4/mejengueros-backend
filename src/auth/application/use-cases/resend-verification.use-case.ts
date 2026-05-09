import { UserRegisteredEvent } from '../../../shared/events/auth-domain.events';
import type { ResendVerificationDependencies } from '../contracts';
import type {
  ResendVerificationCommand,
  ResendVerificationResult,
} from '../dto';

export class ResendVerificationUseCase {
  constructor(private readonly deps: ResendVerificationDependencies) {}

  async execute(
    command: ResendVerificationCommand,
  ): Promise<ResendVerificationResult> {
    const identity = command.email.trim().toLowerCase();
    const now = this.deps.now();
    if (
      await this.deps.throttleStore.isOnCooldown(
        identity,
        now,
        this.deps.resendCooldownMs,
      )
    ) {
      return { accepted: true };
    }
    await this.deps.throttleStore.mark(identity, now);

    const user = await this.deps.userRepository.findByEmail(identity);
    if (!user || user.emailVerified) {
      return { accepted: true };
    }

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

    return { accepted: true };
  }
}
