import { AuthDomainError } from './auth-domain.error';

export class InvalidAuthIdentifierError extends AuthDomainError {
  constructor(identifier: string) {
    super(`Invalid local auth identifier: ${identifier}`);
    this.name = 'InvalidAuthIdentifierError';
  }
}
