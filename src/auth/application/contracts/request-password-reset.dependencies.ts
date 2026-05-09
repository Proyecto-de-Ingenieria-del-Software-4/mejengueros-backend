import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { DomainEventBus } from '../../../shared/events/domain-event-bus.contract';
import type { TokenKeyManagement } from '../../../shared/security/tokens/token-key-management.contract';

export type RequestPasswordResetDependencies = {
  userRepository: Pick<UserRepository, 'findByEmail'>;
  passwordResetTokenRepository: Pick<PasswordResetTokenRepository, 'issue'>;
  tokenKeyManagement: Pick<
    TokenKeyManagement,
    'generateOpaqueToken' | 'fingerprint'
  >;
  eventBus: Pick<DomainEventBus, 'publish'>;
};
