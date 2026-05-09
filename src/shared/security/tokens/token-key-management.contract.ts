export interface TokenKeyManagement {
  generateOpaqueToken(size?: number): string;
  fingerprint(value: string): string;
  signJwtLike(payload: Record<string, unknown>): string;
  verifyJwtLike(token: string): Record<string, unknown>;
}
