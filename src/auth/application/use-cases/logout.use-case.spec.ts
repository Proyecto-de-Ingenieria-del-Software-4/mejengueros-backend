import type { RefreshSessionRepository } from '../../domain/repositories/refresh-session.repository';
import { InvalidRefreshTokenError } from '../../domain/exceptions';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  it('revokes the provided refresh session id', async () => {
    const revokeSessionById = jest.fn().mockResolvedValue(undefined);
    const refreshSessionRepository: RefreshSessionRepository = {
      revokeSessionById,
      revokeSessionFamily: async () => undefined,
    };

    const useCase = new LogoutUseCase({ refreshSessionRepository });

    await expect(
      useCase.execute({ sessionId: 'session-1' }),
    ).resolves.toBeUndefined();
    expect(revokeSessionById).toHaveBeenCalledWith('session-1');
  });

  it('propagates repository failures for controller mapping', async () => {
    const refreshSessionRepository: RefreshSessionRepository = {
      revokeSessionById: async () => {
        throw new InvalidRefreshTokenError();
      },
      revokeSessionFamily: async () => undefined,
    };

    const useCase = new LogoutUseCase({ refreshSessionRepository });

    await expect(
      useCase.execute({ sessionId: 'session-2' }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
