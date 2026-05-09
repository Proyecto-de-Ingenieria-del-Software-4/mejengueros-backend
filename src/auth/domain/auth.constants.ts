export const AUTH_DOMAIN_CONSTANTS = {
  DEFAULT_ROLE: 'USER',
  LOCKOUT_THRESHOLD: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,
} as const;

export type AuthRole = 'USER' | 'ADMIN';
