import type { UserRepository } from '../../domain/repositories/user.repository';
import type { VerificationTokenRepository } from '../../domain/repositories/verification-token.repository';
import type { TokenKeyManagement } from '../../../shared/security/tokens/token-key-management.contract';

export type VerifyEmailDependencies = {
  verificationTokenRepository: Pick<
    VerificationTokenRepository,
    'consumeValid'
  >;
  userRepository: Pick<UserRepository, 'findById' | 'save'>;
  tokenKeyManagement: Pick<TokenKeyManagement, 'fingerprint'>;
  now(): Date;
};
