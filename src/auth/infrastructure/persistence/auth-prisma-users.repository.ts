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
      include: { userRole: { include: { role: true } } },
    });
    return user ? toAuthUserProfile(user) : null;
  }

  async findByUsername(username: string): Promise<AuthUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { userRole: { include: { role: true } } },
    });
    return user ? toAuthUserProfile(user) : null;
  }

  async findByEmail(email: string): Promise<AuthUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userRole: { include: { role: true } } },
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
          userRole: {
            create: {
              role: {
                connect: {
                  code: user.role,
                },
              },
            },
          },
        },
        update: {
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          tokenVersion: user.tokenVersion,
          failedLoginCount: user.failedLoginAttempts,
          lockoutUntil: user.lockUntil,
          userRole: {
            upsert: {
              create: {
                role: {
                  connect: {
                    code: user.role,
                  },
                },
              },
              update: {
                role: {
                  connect: {
                    code: user.role,
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error);
    }
  }

  async updateRole(userId: string, role: 'USER' | 'ADMIN'): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          userRole: {
            upsert: {
              create: {
                role: {
                  connect: {
                    code: role,
                  },
                },
              },
              update: {
                role: {
                  connect: {
                    code: role,
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error);
    }
  }

  async bumpTokenVersion(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      });
    } catch (error) {
      throw mapPrismaAuthError(error);
    }
  }
}
