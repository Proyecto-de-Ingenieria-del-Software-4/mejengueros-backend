export type AccessTokenClaims = {
  sub: string;
  role: 'USER' | 'ADMIN';
  sid: string;
  typ: 'access';
  exp: number;
};
