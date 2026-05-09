import { AuthPrismaUsersRepository } from './auth-prisma-users.repository';
import { AuthPrismaRefreshSessionRepository } from './auth-prisma-refresh-session.repository';
import {
  AuthInfrastructureError,
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions';

describe('Auth Prisma repositories', () => {
  it('maps and saves users through prisma adapter', async () => {
    const prisma: ConstructorParameters<typeof AuthPrismaUsersRepository>[0] = {
      user: {
        upsert: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const repository = new AuthPrismaUsersRepository(prisma);

    await repository.save({
      id: 'user-1',
      username: 'player1',
      email: 'player1@example.com',
      role: 'USER',
      emailVerified: false,
      tokenVersion: 2,
      failedLoginAttempts: 1,
      lockUntil: null,
    });

    expect((prisma.user.upsert as jest.Mock).mock.calls[0][0].create).toEqual(
      expect.objectContaining({
        username: 'player1',
        email: 'player1@example.com',
        userRole: {
          create: {
            role: {
              connect: {
                code: 'USER',
              },
            },
          },
        },
      }),
    );
  });

  it('maps prisma unique email error to domain exception', async () => {
    const prisma: ConstructorParameters<typeof AuthPrismaUsersRepository>[0] = {
      user: {
        upsert: jest.fn().mockRejectedValue({
          code: 'P2002',
          meta: { target: ['email'] },
        }),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const repository = new AuthPrismaUsersRepository(prisma);

    await expect(
      repository.save({
        id: 'user-1',
        username: 'player1',
        email: 'player1@example.com',
        role: 'USER',
        emailVerified: false,
        tokenVersion: 2,
        failedLoginAttempts: 1,
        lockUntil: null,
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('maps prisma unique username error to domain exception', async () => {
    const prisma: ConstructorParameters<typeof AuthPrismaUsersRepository>[0] = {
      user: {
        upsert: jest.fn().mockRejectedValue({
          code: 'P2002',
          meta: { target: ['username'] },
        }),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const repository = new AuthPrismaUsersRepository(prisma);

    await expect(
      repository.save({
        id: 'user-1',
        username: 'player1',
        email: 'player1@example.com',
        role: 'USER',
        emailVerified: false,
        tokenVersion: 2,
        failedLoginAttempts: 1,
        lockUntil: null,
      }),
    ).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
  });

  it('maps unknown prisma/runtime error to safe domain exception', async () => {
    const prisma: ConstructorParameters<typeof AuthPrismaUsersRepository>[0] = {
      user: {
        upsert: jest
          .fn()
          .mockRejectedValue(new Error('db timeout details leaked')),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const repository = new AuthPrismaUsersRepository(prisma);

    await expect(
      repository.save({
        id: 'user-1',
        username: 'player1',
        email: 'player1@example.com',
        role: 'USER',
        emailVerified: false,
        tokenVersion: 2,
        failedLoginAttempts: 1,
        lockUntil: null,
      }),
    ).rejects.toBeInstanceOf(AuthInfrastructureError);
  });

  it('revokes refresh session family via prisma adapter', async () => {
    const prisma: ConstructorParameters<
      typeof AuthPrismaRefreshSessionRepository
    >[0] = {
      refreshSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    const repository = new AuthPrismaRefreshSessionRepository(prisma);

    await repository.revokeSessionFamily('family-1');

    expect(
      (prisma.refreshSession.updateMany as jest.Mock).mock.calls[0][0],
    ).toEqual(
      expect.objectContaining({
        where: { tokenFamily: 'family-1', revokedAt: null },
      }),
    );
  });
});
