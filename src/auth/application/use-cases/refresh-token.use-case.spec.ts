import type { TokenIssuer } from '../../domain/services/token-issuer.service';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  it('rotates and returns a fresh token pair', async () => {
    const tokenIssuer: TokenIssuer = {
      issueForUser: async () => ({
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      }),
      rotateRefreshToken: async (refreshToken) => ({
        accessToken: `a-${refreshToken}`,
        refreshToken: `r-${refreshToken}`,
        refreshSessionId: `s-${refreshToken}`,
        refreshFamilyId: `f-${refreshToken}`,
      }),
    };

    const useCase = new RefreshTokenUseCase({ tokenIssuer });

    await expect(
      useCase.execute({ refreshToken: 'refresh-123' }),
    ).resolves.toEqual({
      accessToken: 'a-refresh-123',
      refreshToken: 'r-refresh-123',
      refreshSessionId: 's-refresh-123',
      refreshFamilyId: 'f-refresh-123',
    });
  });
});
