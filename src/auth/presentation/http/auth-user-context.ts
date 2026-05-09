export type AuthUserContext = {
  userId: string;
  role: 'USER' | 'ADMIN';
  sessionId?: string;
};
