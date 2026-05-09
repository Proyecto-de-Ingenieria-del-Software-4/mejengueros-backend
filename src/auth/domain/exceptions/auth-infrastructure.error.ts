import { AuthDomainError } from './auth-domain.error';
import { HttpStatusCode } from '../../../shared/domain/enums/http-status-code.enum';

export class AuthInfrastructureError extends AuthDomainError {
  readonly code = 'auth/service-unavailable';
  readonly httpStatus = HttpStatusCode.SERVICE_UNAVAILABLE;

  constructor(options?: {
    metadata?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super('Authentication service is temporarily unavailable', options);
  }
}
