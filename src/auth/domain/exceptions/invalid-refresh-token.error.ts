import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class InvalidRefreshTokenError extends AuthDomainError {
  readonly code = 'auth/invalid-refresh-token';
  readonly httpStatus = HttpStatusCode.UNAUTHORIZED;

  constructor() {
    super('Invalid refresh token');
  }
}
