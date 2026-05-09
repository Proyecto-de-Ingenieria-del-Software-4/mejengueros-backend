import { UserNotFoundError } from '../../domain/exceptions/auth-domain.exceptions';
import { GetCurrentProfileUseCase } from './get-current-profile.use-case';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';

describe('GetCurrentProfileUseCase', () => {
  it('returns sanitized profile for an existing user', async () => {
    const useCase = new GetCurrentProfileUseCase({
      userRepository: {
        findById: async () => createAuthUserStub(),
      },
    });

    await expect(useCase.execute({ userId: 'user-1' })).resolves.toEqual({
      id: 'user-1',
      username: 'player1',
      email: 'player1@example.com',
      roles: ['USER'],
      emailVerified: true,
    });
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    const useCase = new GetCurrentProfileUseCase({
      userRepository: { findById: async () => null },
    });

    await expect(useCase.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });
});
