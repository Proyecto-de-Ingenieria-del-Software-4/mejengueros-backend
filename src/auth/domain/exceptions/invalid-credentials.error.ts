import { AuthDomainError } from './auth-domain.error';

export class InvalidCredentialsError extends AuthDomainError {
  constructor() {
    super('INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}
