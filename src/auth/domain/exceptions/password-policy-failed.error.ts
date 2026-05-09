import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class PasswordPolicyFailedError extends AuthDomainError {
  readonly code = 'auth/password-policy-failed';
  readonly httpStatus = HttpStatusCode.BAD_REQUEST;

  constructor() {
    super('Password policy validation failed');
  }
}
