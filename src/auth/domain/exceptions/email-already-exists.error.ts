import { AuthDomainError } from './auth-domain.error';

export class EmailAlreadyExistsError extends AuthDomainError {
  constructor() {
    super('EMAIL_ALREADY_EXISTS');
    this.name = 'EmailAlreadyExistsError';
  }
}
