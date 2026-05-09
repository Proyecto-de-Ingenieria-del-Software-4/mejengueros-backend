import { Injectable } from '@nestjs/common';
import {
  type PasswordPolicy,
  type PasswordPolicyValidator,
  type PasswordValidationResult,
} from './password-policy-validator.contract';

@Injectable()
export class PasswordPolicyValidatorService implements PasswordPolicyValidator {
  validate(password: string, policy: PasswordPolicy): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push('PASSWORD_TOO_SHORT');
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('PASSWORD_UPPERCASE_REQUIRED');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('PASSWORD_LOWERCASE_REQUIRED');
    }

    if (policy.requireNumber && !/[0-9]/.test(password)) {
      errors.push('PASSWORD_NUMBER_REQUIRED');
    }

    if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('PASSWORD_SYMBOL_REQUIRED');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
