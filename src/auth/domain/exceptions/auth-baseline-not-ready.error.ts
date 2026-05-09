import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class AuthBaselineNotReadyError extends AuthDomainError {
  readonly code = 'auth/baseline-not-ready';
  readonly httpStatus = HttpStatusCode.SERVICE_UNAVAILABLE;

  constructor(options?: {
    metadata?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super('Authentication baseline is not ready', options);
  }
}
