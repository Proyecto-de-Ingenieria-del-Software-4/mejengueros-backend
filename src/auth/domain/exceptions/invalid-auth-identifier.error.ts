import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class InvalidAuthIdentifierError extends AuthDomainError {
  readonly code = 'auth/invalid-auth-identifier';
  readonly httpStatus = HttpStatusCode.UNAUTHORIZED;

  constructor(identifier: string) {
    super(`Invalid local auth identifier: ${identifier}`);
  }
}
