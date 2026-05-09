import { AuthDomainError } from './auth-domain.error';

export class EmailVerificationRequiredError extends AuthDomainError {
  constructor() {
    super('EMAIL_VERIFICATION_REQUIRED');
    this.name = 'EmailVerificationRequiredError';
  }
}
