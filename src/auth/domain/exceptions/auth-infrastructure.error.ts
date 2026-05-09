import { AuthDomainError } from './auth-domain.error';

export class AuthInfrastructureError extends AuthDomainError {
  constructor() {
    super('AUTH_INFRASTRUCTURE_ERROR');
    this.name = 'AuthInfrastructureError';
  }
}
