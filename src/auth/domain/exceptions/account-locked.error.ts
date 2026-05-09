import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class AccountLockedError extends AuthDomainError {
  readonly code = 'auth/account-locked';
  readonly httpStatus = HttpStatusCode.LOCKED;

  constructor() {
    super('Account is temporarily locked');
  }
}
