import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class InvalidCredentialsError extends AuthDomainError {
  readonly code = 'auth/invalid-credentials';
  readonly httpStatus = HttpStatusCode.UNAUTHORIZED;

  constructor() {
    super('Invalid credentials');
  }
}
