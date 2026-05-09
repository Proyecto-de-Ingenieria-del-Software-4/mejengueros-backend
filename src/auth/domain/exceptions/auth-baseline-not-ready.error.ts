import { AuthDomainError } from './auth-domain.error';

export class AuthBaselineNotReadyError extends AuthDomainError {
  constructor() {
    super('AUTH_BASELINE_NOT_READY');
    this.name = 'AuthBaselineNotReadyError';
  }
}
