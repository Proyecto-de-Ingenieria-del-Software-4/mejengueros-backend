import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class UsernameAlreadyExistsError extends AuthDomainError {
  readonly code = 'auth/username-already-in-use';
  readonly httpStatus = HttpStatusCode.CONFLICT;

  constructor() {
    super('Username already exists');
  }
}
