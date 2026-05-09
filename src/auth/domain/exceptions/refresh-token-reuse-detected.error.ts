import { AuthDomainError } from './auth-domain.error';

export class RefreshTokenReuseDetectedError extends AuthDomainError {
  constructor() {
    super('REFRESH_TOKEN_REUSE_DETECTED');
  }
}
