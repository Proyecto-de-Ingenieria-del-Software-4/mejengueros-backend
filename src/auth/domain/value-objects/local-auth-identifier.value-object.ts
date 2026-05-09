import { InvalidAuthIdentifierError } from '../exceptions/auth-domain.exceptions';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;

export class LocalAuthIdentifier {
  private constructor(public readonly value: string) {}

  static create(identifier: string): LocalAuthIdentifier {
    if (identifier.includes('@') || !USERNAME_REGEX.test(identifier)) {
      throw new InvalidAuthIdentifierError(identifier);
    }

    return new LocalAuthIdentifier(identifier);
  }
}
