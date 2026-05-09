import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class UserNotFoundError extends AuthDomainError {
  readonly code = 'auth/user-not-found';
  readonly httpStatus = HttpStatusCode.FORBIDDEN;

  constructor() {
    super('User not found');
  }
}
