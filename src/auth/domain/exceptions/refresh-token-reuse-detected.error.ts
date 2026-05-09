import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class RefreshTokenReuseDetectedError extends AuthDomainError {
  readonly code = 'auth/refresh-token-reuse-detected';
  readonly httpStatus = HttpStatusCode.UNAUTHORIZED;

  constructor() {
    super('Refresh token reuse detected');
  }
}
