import { buildAuthSeedPlan } from './seed';

describe('buildAuthSeedPlan', () => {
  it('returns deterministic baseline roles and password policy', () => {
    const plan = buildAuthSeedPlan();

    expect(plan.roles).toEqual(['USER', 'ADMIN']);
    expect(plan.authProviders).toEqual(['LOCAL', 'GOOGLE']);
    expect(plan.passwordPolicy).toEqual({
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: false,
    });
  });
});
