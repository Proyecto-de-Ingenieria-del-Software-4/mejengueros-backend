import type { CredentialsRepository } from '../../domain/repositories/credentials.repository';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { PasswordHasher } from '../../../shared/security/password/password-hasher.contract';
import type {
  PasswordPolicy,
  PasswordPolicyValidator,
} from '../../../shared/security/password/password-policy-validator.contract';
import type { TokenKeyManagement } from '../../../shared/security/tokens/token-key-management.contract';

export type ResetPasswordDependencies = {
  passwordPolicyValidator: Pick<PasswordPolicyValidator, 'validate'>;
  passwordResetTokenRepository: Pick<
    PasswordResetTokenRepository,
    'consumeValid'
  >;
  userRepository: Pick<UserRepository, 'findById' | 'bumpTokenVersion'>;
  credentialsRepository: Pick<CredentialsRepository, 'setPasswordHash'>;
  tokenKeyManagement: Pick<TokenKeyManagement, 'fingerprint'>;
  passwordHasher: Pick<PasswordHasher, 'hash'>;
  passwordPolicy: PasswordPolicy;
  now(): Date;
};
