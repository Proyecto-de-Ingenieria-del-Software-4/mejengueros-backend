import type { CredentialsRepository } from '../../domain/repositories/credentials.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import type { TokenIssuer } from '../../domain/services/token-issuer.service';
import type { DomainEventBus } from '../../../shared/events/domain-event-bus.contract';
import type { PasswordHasher } from '../../../shared/security/password/password-hasher.contract';
import type {
  PasswordPolicy,
  PasswordPolicyValidator,
} from '../../../shared/security/password/password-policy-validator.contract';
import type { TokenKeyManagement } from '../../../shared/security/tokens/token-key-management.contract';

export type RegisterLocalDependencies = {
  userRepository: Pick<
    UserRepository,
    'findByUsername' | 'findByEmail' | 'save'
  >;
  credentialsRepository: Pick<CredentialsRepository, 'setPasswordHash'>;
  verificationTokenRepository: Pick<VerificationTokenRepository, 'issue'>;
  tokenIssuer: Pick<TokenIssuer, 'issueForUser'>;
  passwordHasher: Pick<PasswordHasher, 'hash'>;
  passwordPolicyValidator: Pick<PasswordPolicyValidator, 'validate'>;
  tokenKeyManagement: Pick<
    TokenKeyManagement,
    'generateOpaqueToken' | 'fingerprint'
  >;
  eventBus: Pick<DomainEventBus, 'publish'>;
  passwordPolicy: PasswordPolicy;
};
