import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import { mapPrismaAuthError } from './error-mapping/map-prisma-auth-error.util';

type TokensPrismaClient = {
  emailVerificationToken: {
    create(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<{
      id: string;
      userId: string;
      consumedAt: Date | null;
      expiresAt: Date;
    } | null>;
    update(args: unknown): Promise<unknown>;
  };
  passwordResetToken: {
    create(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<{
      id: string;
      userId: string;
      consumedAt: Date | null;
      expiresAt: Date;
    } | null>;
    update(args: unknown): Promise<unknown>;
  };
};

@Injectable()
export class AuthPrismaVerificationTokensRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: TokensPrismaClient,
  ) {}

  async issue(command: {
    userId: string;
    tokenHash: string;
    expiresAt?: Date;
  }): Promise<void> {
    try {
      await this.prisma.emailVerificationToken.create({
        data: {
          userId: command.userId,
          tokenHash: command.tokenHash,
          expiresAt:
            command.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-verification-tokens',
        operation: 'issue-verification-token',
      });
    }
  }

  async consumeValid(command: {
    tokenHash: string;
    now?: Date;
  }): Promise<{ userId: string } | null> {
    try {
      const now = command.now ?? new Date();
      const token = await this.prisma.emailVerificationToken.findUnique({
        where: { tokenHash: command.tokenHash },
      });
      if (
        !token ||
        token.consumedAt ||
        token.expiresAt.getTime() <= now.getTime()
      ) {
        return null;
      }
      await this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { consumedAt: now },
      });
      return { userId: token.userId };
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-verification-tokens',
        operation: 'consume-verification-token',
      });
    }
  }
}

@Injectable()
export class AuthPrismaPasswordResetTokensRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: TokensPrismaClient,
  ) {}

  async issue(command: {
    userId: string;
    tokenHash: string;
    expiresAt?: Date;
  }): Promise<void> {
    try {
      await this.prisma.passwordResetToken.create({
        data: {
          userId: command.userId,
          tokenHash: command.tokenHash,
          expiresAt: command.expiresAt ?? new Date(Date.now() + 1000 * 60 * 30),
        },
      });
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-password-reset-tokens',
        operation: 'issue-password-reset-token',
      });
    }
  }

  async consumeValid(command: {
    tokenHash: string;
    now?: Date;
  }): Promise<{ userId: string } | null> {
    try {
      const now = command.now ?? new Date();
      const token = await this.prisma.passwordResetToken.findUnique({
        where: { tokenHash: command.tokenHash },
      });
      if (
        !token ||
        token.consumedAt ||
        token.expiresAt.getTime() <= now.getTime()
      ) {
        return null;
      }
      await this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { consumedAt: now },
      });
      return { userId: token.userId };
    } catch (error) {
      throw mapPrismaAuthError(error, {
        repository: 'auth-prisma-password-reset-tokens',
        operation: 'consume-password-reset-token',
      });
    }
  }
}
