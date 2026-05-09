import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class EmailAlreadyExistsError extends AuthDomainError {
  readonly code = 'auth/email-already-in-use';
  readonly httpStatus = HttpStatusCode.CONFLICT;

  constructor() {
    super('Email already exists');
  }
}
