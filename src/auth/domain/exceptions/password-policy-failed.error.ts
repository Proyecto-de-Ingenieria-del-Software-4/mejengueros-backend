import { AuthDomainError } from './auth-domain.error';

export class PasswordPolicyFailedError extends AuthDomainError {
  constructor() {
    super('PASSWORD_POLICY_FAILED');
    this.name = 'PasswordPolicyFailedError';
  }
}
