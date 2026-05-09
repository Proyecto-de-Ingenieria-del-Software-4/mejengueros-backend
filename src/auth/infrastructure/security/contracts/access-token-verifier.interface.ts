import type { VerifiedAccessToken } from './verified-access-token.type';

export interface AccessTokenVerifier {
  verifyAccessToken(token: string): VerifiedAccessToken;
}
