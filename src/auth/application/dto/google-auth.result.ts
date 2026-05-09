export type GoogleAuthResult = {
  allowed: boolean;
  reason: 'GOOGLE_AUTH_READY' | 'GOOGLE_LINK_CONFLICT';
  email?: string;
  subject?: string;
};
