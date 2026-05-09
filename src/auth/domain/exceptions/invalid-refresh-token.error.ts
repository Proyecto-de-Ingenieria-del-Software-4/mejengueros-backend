import { AuthDomainError } from './auth-domain.error';

export class InvalidRefreshTokenError extends AuthDomainError {
  constructor() {
    super('INVALID_REFRESH_TOKEN');
  }
}
