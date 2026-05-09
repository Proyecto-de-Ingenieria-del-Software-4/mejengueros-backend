import { AuthDomainError } from './auth-domain.error';

export class ForbiddenAuthActionError extends AuthDomainError {
  constructor() {
    super('FORBIDDEN');
    this.name = 'ForbiddenAuthActionError';
  }
}
