import { AuthDomainError } from './auth-domain.error';

export class InvalidOrExpiredTokenError extends AuthDomainError {
  constructor() {
    super('INVALID_OR_EXPIRED_TOKEN');
    this.name = 'InvalidOrExpiredTokenError';
  }
}
