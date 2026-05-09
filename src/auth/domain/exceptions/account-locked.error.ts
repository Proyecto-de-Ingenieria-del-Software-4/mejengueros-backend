import { AuthDomainError } from './auth-domain.error';

export class AccountLockedError extends AuthDomainError {
  constructor() {
    super('ACCOUNT_LOCKED');
    this.name = 'AccountLockedError';
  }
}
