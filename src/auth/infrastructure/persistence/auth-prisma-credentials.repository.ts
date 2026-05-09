import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import { mapPrismaAuthError } from './error-mapping/map-prisma-auth-error.util';

type CredentialsPrismaClient = {
  authIdentity: {
    findFirst(
      args: unknown,
    ): Promise<{ id: string; passwordHash?: string | null } | null>;
    update(args: unknown): Promise<unknown>;
    create(args: unknown): Promise<unknown>;
  };
};

@Injectable()
export class AuthPrismaCredentialsRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: CredentialsPrismaClient,
  ) {}

  async findPasswordHashByUserId(userId: string): Promise<string | null> {
    try {
      const identity = await this.prisma.authIdentity.findFirst({
        where: { userId, provider: { code: 'LOCAL' } },
        select: { passwordHash: true },
      });
      return identity?.passwordHash ?? null;
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-credentials',
        operation: 'find-local-password-hash',
      });
    }
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    try {
      const existing = await this.prisma.authIdentity.findFirst({
        where: { userId, provider: { code: 'LOCAL' } },
        select: { id: true },
      });

      if (existing) {
        await this.prisma.authIdentity.update({
          where: { id: existing.id },
          data: { passwordHash },
        });
        return;
      }

      await this.prisma.authIdentity.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          provider: {
            connect: {
              code: 'LOCAL',
            },
          },
          providerUserId: userId,
          passwordHash,
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-credentials',
        operation: 'set-local-password-hash',
      });
    }
  }
}
