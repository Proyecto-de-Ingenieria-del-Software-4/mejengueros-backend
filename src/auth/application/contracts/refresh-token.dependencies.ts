import type { TokenIssuer } from '../../domain/services/token-issuer.service';

export type RefreshTokenDependencies = {
  tokenIssuer: Pick<TokenIssuer, 'rotateRefreshToken'>;
};
