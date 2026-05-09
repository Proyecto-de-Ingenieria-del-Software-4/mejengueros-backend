import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class InvalidOrExpiredTokenError extends AuthDomainError {
  readonly code = 'auth/invalid-or-expired-token';
  readonly httpStatus = HttpStatusCode.UNAUTHORIZED;

  constructor() {
    super('Invalid or expired token');
  }
}
