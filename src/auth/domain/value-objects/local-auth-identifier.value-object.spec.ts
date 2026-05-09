import { InvalidAuthIdentifierError } from '../exceptions/auth-domain.exceptions';
import { LocalAuthIdentifier } from './local-auth-identifier.value-object';

describe('LocalAuthIdentifier', () => {
  it('accepts username identifier', () => {
    const identifier = LocalAuthIdentifier.create('valid_user-123');

    expect(identifier.value).toBe('valid_user-123');
  });

  it('rejects email identifier for local login policy', () => {
    expect(() => LocalAuthIdentifier.create('user@example.com')).toThrow(
      InvalidAuthIdentifierError,
    );
  });
});
