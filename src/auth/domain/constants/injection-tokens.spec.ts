import { AUTH_TOKENS } from './injection-tokens';
import { SHARED_TOKENS } from '../../../shared/domain/constants/injection-tokens';

describe('AUTH_TOKENS', () => {
  it('exposes canonical auth dependency tokens', () => {
    expect(AUTH_TOKENS.USER_REPOSITORY).toBe('AUTH/USER_REPOSITORY');
    expect(AUTH_TOKENS.CREDENTIALS_REPOSITORY).toBe(
      'AUTH/CREDENTIALS_REPOSITORY',
    );
    expect(AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY).toBe(
      'AUTH/VERIFICATION_TOKEN_REPOSITORY',
    );
    expect(AUTH_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY).toBe(
      'AUTH/PASSWORD_RESET_TOKEN_REPOSITORY',
    );
    expect(AUTH_TOKENS.REFRESH_SESSION_REPOSITORY).toBe(
      'AUTH/REFRESH_SESSION_REPOSITORY',
    );
    expect(AUTH_TOKENS.GOOGLE_AUTH_VERIFIER).toBe('AUTH/GOOGLE_AUTH_VERIFIER');
    expect(AUTH_TOKENS.TOKEN_ISSUER).toBe('AUTH/TOKEN_ISSUER');
  });
});

describe('SHARED_TOKENS', () => {
  it('exposes shared cross-slice contracts', () => {
    expect(SHARED_TOKENS.DOMAIN_EVENT_BUS).toBe('SHARED/DOMAIN_EVENT_BUS');
    expect(SHARED_TOKENS.PASSWORD_HASHER).toBe('SHARED/PASSWORD_HASHER');
    expect(SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR).toBe(
      'SHARED/PASSWORD_POLICY_VALIDATOR',
    );
    expect(SHARED_TOKENS.TOKEN_KEY_MANAGEMENT).toBe(
      'SHARED/TOKEN_KEY_MANAGEMENT',
    );
  });
});
