export type VerifiedAccessToken = {
  sub: string;
  role: 'USER' | 'ADMIN';
  sid: string;
};
