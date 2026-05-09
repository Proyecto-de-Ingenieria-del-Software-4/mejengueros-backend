import type { UserRepository } from '../../domain/repositories/user.repository';
import type { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import type { DomainEventBus } from '../../../shared/events/domain-event-bus.contract';
import type { TokenKeyManagement } from '../../../shared/security/tokens/token-key-management.contract';
import type { ResendVerificationThrottleStore } from './resend-verification-throttle-store.contract';

export type ResendVerificationDependencies = {
  userRepository: Pick<UserRepository, 'findByEmail'>;
  verificationTokenRepository: Pick<VerificationTokenRepository, 'issue'>;
  tokenKeyManagement: Pick<
    TokenKeyManagement,
    'generateOpaqueToken' | 'fingerprint'
  >;
  throttleStore: ResendVerificationThrottleStore;
  eventBus: Pick<DomainEventBus, 'publish'>;
  now(): Date;
  resendCooldownMs: number;
};
