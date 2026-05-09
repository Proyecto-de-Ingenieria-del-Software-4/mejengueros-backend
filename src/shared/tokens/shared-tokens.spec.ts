import { SHARED_TOKENS } from './shared-tokens';

describe('SHARED_TOKENS', () => {
  it('exposes stable dependency injection tokens', () => {
    expect(SHARED_TOKENS.PRISMA_SERVICE).toBe('SHARED/PRISMA_SERVICE');
    expect(SHARED_TOKENS.PASSWORD_HASHER).toBe('SHARED/PASSWORD_HASHER');
    expect(SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR).toBe(
      'SHARED/PASSWORD_POLICY_VALIDATOR',
    );
    expect(SHARED_TOKENS.TOKEN_KEY_MANAGEMENT).toBe(
      'SHARED/TOKEN_KEY_MANAGEMENT',
    );
    expect(SHARED_TOKENS.APP_CONFIG).toBe('SHARED/APP_CONFIG');
  });
});
