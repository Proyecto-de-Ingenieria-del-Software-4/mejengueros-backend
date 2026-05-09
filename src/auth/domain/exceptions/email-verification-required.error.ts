import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class EmailVerificationRequiredError extends AuthDomainError {
  readonly code = 'auth/email-verification-required';
  readonly httpStatus = HttpStatusCode.FORBIDDEN;

  constructor() {
    super('Email verification is required');
  }
}
