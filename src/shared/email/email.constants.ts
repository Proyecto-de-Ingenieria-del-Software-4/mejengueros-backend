export const AUTH_EMAIL_TEMPLATES = {
  VERIFY_EMAIL: 'auth.verify-email',
  PASSWORD_RESET: 'auth.password-reset',
} as const;

export type AuthEmailTemplate =
  (typeof AUTH_EMAIL_TEMPLATES)[keyof typeof AUTH_EMAIL_TEMPLATES];
