import { Inject, Injectable } from '@nestjs/common';
import type { AuthUserProfile } from '../../domain/types/auth-user-profile.type';
import { toAuthUserProfile } from './auth-prisma.mapper';
import type { PrismaUserRecord } from './auth-prisma.mapper';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import { mapPrismaAuthError } from './error-mapping/map-prisma-auth-error.util';

type UsersPrismaClient = {
  user: {
    findUnique(args: unknown): Promise<PrismaUserRecord | null>;
    upsert(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
};

@Injectable()
export class AuthPrismaUsersRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: UsersPrismaClient,
  ) {}

  async findById(id: string): Promise<AuthUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
    return user ? toAuthUserProfile(user) : null;
  }

  async findByUsername(username: string): Promise<AuthUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { userRoles: { include: { role: true } } },
    });
    return user ? toAuthUserProfile(user) : null;
  }

  async findByEmail(email: string): Promise<AuthUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
    return user ? toAuthUserProfile(user) : null;
  }

  async save(user: AuthUserProfile): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          tokenVersion: user.tokenVersion,
          failedLoginCount: user.failedLoginAttempts,
          lockoutUntil: user.lockUntil,
          userRoles: {
            create: user.roles.map((role) => ({
              role: {
                connect: {
                  code: role,
                },
              },
            })),
          },
        },
        update: {
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          tokenVersion: user.tokenVersion,
          failedLoginCount: user.failedLoginAttempts,
          lockoutUntil: user.lockUntil,
          userRoles: {
            deleteMany: {},
            create: user.roles.map((role) => ({
              role: {
                connect: {
                  code: role,
                },
              },
            })),
          },
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-users',
        operation: 'save-user',
      });
    }
  }

  async updateRole(userId: string, role: 'USER' | 'ADMIN'): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          userRoles: {
            create: {
              role: {
                connect: {
                  code: role,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-users',
        operation: 'update-user-role',
      });
    }
  }

  async bumpTokenVersion(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-users',
        operation: 'bump-user-token-version',
      });
    }
  }
}
