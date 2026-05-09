import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import { mapPrismaAuthError } from './error-mapping/map-prisma-auth-error.util';

type RefreshSessionPrismaClient = {
  refreshSession: {
    updateMany(args: unknown): Promise<unknown>;
  };
};

@Injectable()
export class AuthPrismaRefreshSessionRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: RefreshSessionPrismaClient,
  ) {}

  async revokeSessionById(sessionId: string): Promise<void> {
    try {
      await this.prisma.refreshSession.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      throw mapPrismaAuthError(error);
    }
  }

  async revokeSessionFamily(sessionFamilyId: string): Promise<void> {
    try {
      await this.prisma.refreshSession.updateMany({
        where: { tokenFamily: sessionFamilyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      throw mapPrismaAuthError(error);
    }
  }
}
