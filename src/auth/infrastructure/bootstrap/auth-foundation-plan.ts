export type AuthFoundationPlan = {
  roles: string[];
  authProviders: string[];
  appKey: {
    kid: string;
    algorithm: string;
    purpose: string;
    status: 'ACTIVE';
    fingerprint: string;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
  };
};

export function buildAuthFoundationPlan(): AuthFoundationPlan {
  return {
    roles: ['USER', 'ADMIN'],
    authProviders: ['LOCAL', 'GOOGLE'],
    appKey: {
      kid: 'app-key-active',
      algorithm: 'HS256',
      purpose: 'AUTH_REFRESH',
      status: 'ACTIVE',
      fingerprint: 'seed-app-key-active',
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: false,
    },
  };
}
