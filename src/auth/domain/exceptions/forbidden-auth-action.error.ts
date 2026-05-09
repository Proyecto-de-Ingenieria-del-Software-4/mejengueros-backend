import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class ForbiddenAuthActionError extends AuthDomainError {
  readonly code = 'auth/forbidden-action';
  readonly httpStatus = HttpStatusCode.FORBIDDEN;

  constructor() {
    super('Forbidden authentication action');
  }
}
