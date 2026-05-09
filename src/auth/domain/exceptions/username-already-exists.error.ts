import { AuthDomainError } from './auth-domain.error';

export class UsernameAlreadyExistsError extends AuthDomainError {
  constructor() {
    super('USERNAME_ALREADY_EXISTS');
    this.name = 'UsernameAlreadyExistsError';
  }
}
