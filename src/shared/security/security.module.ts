import { Global, Module } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import { BcryptPasswordHasherService } from './password/bcrypt-password-hasher.service';
import { PasswordPolicyValidatorService } from './password/password-policy-validator.service';
import { TokenKeyManagementService } from './tokens/token-key-management.service';

@Global()
@Module({
  providers: [
    {
      provide: SHARED_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasherService,
    },
    {
      provide: SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR,
      useClass: PasswordPolicyValidatorService,
    },
    {
      provide: SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
      useClass: TokenKeyManagementService,
    },
    BcryptPasswordHasherService,
    PasswordPolicyValidatorService,
    TokenKeyManagementService,
  ],
  exports: [
    SHARED_TOKENS.PASSWORD_HASHER,
    SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR,
    SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
    BcryptPasswordHasherService,
    PasswordPolicyValidatorService,
    TokenKeyManagementService,
  ],
})
export class SharedSecurityModule {}
