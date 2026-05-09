import { buildAuthSeedPlan } from './seed';

describe('buildAuthSeedPlan', () => {
  it('returns deterministic baseline roles, app key, and password policy', () => {
    const plan = buildAuthSeedPlan();

    expect(plan.roles).toEqual(['USER', 'ADMIN']);
    expect(plan.authProviders).toEqual(['LOCAL', 'GOOGLE']);
    expect(plan.appKey).toEqual({
      kid: 'app-key-active',
      algorithm: 'HS256',
      purpose: 'AUTH_REFRESH',
      status: 'ACTIVE',
      fingerprint: 'seed-app-key-active',
    });
    expect(plan.passwordPolicy).toEqual({
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: false,
    });
  });
});
