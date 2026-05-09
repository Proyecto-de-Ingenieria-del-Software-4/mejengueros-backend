import { AuthDomainError } from './auth-domain.error';

export class UserNotFoundError extends AuthDomainError {
  constructor() {
    super('USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}
