import { UpdateUserRoleUseCase } from './update-user-role.use-case';
import { ForbiddenAuthActionError } from '../../domain/exceptions/auth-domain.exceptions';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';

describe('UpdateUserRoleUseCase', () => {
  it('throws forbidden when actor is not admin', async () => {
    const updateRole = jest.fn();
    const useCase = new UpdateUserRoleUseCase({
      userRepository: {
        findById: async () => createAuthUserStub(),
        updateRole,
      },
    });

    await expect(
      useCase.execute({
        actorUserId: 'user-1',
        targetUserId: 'user-2',
        role: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ForbiddenAuthActionError);
    expect(updateRole).not.toHaveBeenCalled();
  });

  it('updates target role when actor is admin', async () => {
    const updateRole = jest.fn(async () => undefined);
    const useCase = new UpdateUserRoleUseCase({
      userRepository: {
        findById: async () =>
          createAuthUserStub({
            id: 'admin-1',
            username: 'admin',
            email: 'admin@example.com',
            roles: ['ADMIN'],
          }),
        updateRole,
      },
    });

    await expect(
      useCase.execute({
        actorUserId: 'admin-1',
        targetUserId: 'user-2',
        role: 'ADMIN',
      }),
    ).resolves.toBeUndefined();

    expect(updateRole).toHaveBeenCalledWith('user-2', 'ADMIN');
  });
});
