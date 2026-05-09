export class AuthDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthDomainError';
  }
}
