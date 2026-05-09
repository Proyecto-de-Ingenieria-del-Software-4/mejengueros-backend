import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { TokenKeyManagementService } from '../../../shared/security/tokens/token-key-management.service';
import type { IssueTokensResult } from '../../domain/services/issue-tokens.result';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import {
  InvalidRefreshTokenError,
  InvalidOrExpiredTokenError,
  RefreshTokenReuseDetectedError,
} from '../../domain/exceptions';

type TokenPrismaClient = {
  appKey?: {
    findFirst(args: unknown): Promise<{ id: string } | null>;
  };
  refreshSession: {
    create(args: unknown): Promise<unknown>;
    findFirst(args: unknown): Promise<{
      id: string;
      userId: string;
      tokenHash: string;
      tokenFamily: string;
      version: number;
      appKeyId: string | null;
      revokedAt: Date | null;
      expiresAt: Date;
    } | null>;
    updateMany(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  user?: {
    findUnique(args: unknown): Promise<{
      tokenVersion: number;
      role?: 'USER' | 'ADMIN';
    } | null>;
  };
};

type RefreshTokenClaims = {
  sub: string;
  sid: string;
  tv: number;
  jti: string;
  akid: string;
  typ: 'refresh';
  exp: number;
};

@Injectable()
export class RefreshTokenIssuerAdapter {
  private readonly fallbackActiveAppKeyId = 'app-key-active';

  constructor(
    @Inject(PrismaService) private readonly prisma: TokenPrismaClient,
    private readonly tokenKeyManagement: TokenKeyManagementService,
  ) {}

  async issueForUser(
    userId: string,
    tokenVersion: number,
  ): Promise<IssueTokensResult> {
    const user = this.prisma.user
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : null;
    const userRole = user?.role ?? 'USER';
    const refreshSessionId = randomUUID();
    const refreshJti = randomUUID();
    const refreshFamilyId = randomUUID();
    const appKeyId = await this.resolveActiveAppKeyId();
    const refreshClaims: RefreshTokenClaims = {
      sub: userId,
      sid: refreshSessionId,
      tv: tokenVersion,
      jti: refreshJti,
      akid: appKeyId,
      typ: 'refresh',
      exp: Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 14) / 1000),
    };
    const refreshToken = this.tokenKeyManagement.signJwtLike(refreshClaims);
    const accessToken = this.tokenKeyManagement.signJwtLike({
      sub: userId,
      sid: refreshSessionId,
      role: userRole,
      typ: 'access',
      exp: Math.floor((Date.now() + 1000 * 60 * 15) / 1000),
    });

    await this.prisma.refreshSession.create({
      data: {
        id: refreshSessionId,
        userId,
        tokenHash: this.tokenKeyManagement.fingerprint(refreshToken),
        tokenFamily: refreshFamilyId,
        version: tokenVersion,
        appKeyId,
        expiresAt: new Date(refreshClaims.exp * 1000),
      },
    });

    return { accessToken, refreshToken, refreshSessionId, refreshFamilyId };
  }

  async rotateRefreshToken(refreshToken: string): Promise<IssueTokensResult> {
    const claims = this.assertRefreshClaims(refreshToken);
    const tokenHash = this.tokenKeyManagement.fingerprint(refreshToken);
    const current = await this.prisma.refreshSession.findFirst({
      where: { id: claims.sid },
    });

    if (!current) {
      const reused = await this.prisma.refreshSession.findFirst({
        where: { tokenHash, revokedAt: { not: null } },
      });
      if (reused) {
        await this.prisma.refreshSession.updateMany({
          where: { tokenFamily: reused.tokenFamily, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new InvalidRefreshTokenError();
    }

    if (current.tokenHash !== tokenHash) {
      await this.prisma.refreshSession.updateMany({
        where: { tokenFamily: current.tokenFamily, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new RefreshTokenReuseDetectedError();
    }

    if (current.version !== claims.tv) {
      throw new InvalidRefreshTokenError();
    }

    if (current.appKeyId && current.appKeyId !== claims.akid) {
      throw new InvalidRefreshTokenError();
    }

    if (this.prisma.user) {
      const user = await this.prisma.user.findUnique({
        where: { id: current.userId },
      });
      if (!user || user.tokenVersion !== claims.tv) {
        throw new InvalidRefreshTokenError();
      }
    }

    if (current.revokedAt || current.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshSession.updateMany({
        where: { tokenFamily: current.tokenFamily, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new RefreshTokenReuseDetectedError();
    }

    await this.prisma.refreshSession.update({
      where: { id: current.id },
      data: { revokedAt: new Date() },
    });

    const nextSessionId = randomUUID();
    const nextRefreshClaims: RefreshTokenClaims = {
      sub: current.userId,
      sid: nextSessionId,
      tv: current.version,
      jti: randomUUID(),
      akid: current.appKeyId ?? (await this.resolveActiveAppKeyId()),
      typ: 'refresh',
      exp: Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 14) / 1000),
    };
    const nextRefreshToken =
      this.tokenKeyManagement.signJwtLike(nextRefreshClaims);
    const nextAccessToken = this.tokenKeyManagement.signJwtLike({
      sub: current.userId,
      sid: nextSessionId,
      role: 'USER',
      typ: 'access',
      exp: Math.floor((Date.now() + 1000 * 60 * 15) / 1000),
    });

    await this.prisma.refreshSession.create({
      data: {
        id: nextSessionId,
        userId: current.userId,
        tokenHash: this.tokenKeyManagement.fingerprint(nextRefreshToken),
        tokenFamily: current.tokenFamily,
        version: current.version,
        appKeyId: current.appKeyId,
        expiresAt: new Date(nextRefreshClaims.exp * 1000),
      },
    });

    return {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      refreshSessionId: nextSessionId,
      refreshFamilyId: current.tokenFamily,
    };
  }

  parseTokenUnsafe(token: string): RefreshTokenClaims {
    return this.tokenKeyManagement.verifyJwtLike(token) as RefreshTokenClaims;
  }

  private assertRefreshClaims(token: string): RefreshTokenClaims {
    const payload = this.tokenKeyManagement.verifyJwtLike(
      token,
    ) as Partial<RefreshTokenClaims>;
    if (
      !payload.sub ||
      !payload.sid ||
      typeof payload.tv !== 'number' ||
      !payload.jti ||
      !payload.akid ||
      payload.typ !== 'refresh' ||
      typeof payload.exp !== 'number'
    ) {
      throw new InvalidOrExpiredTokenError();
    }

    if (payload.exp * 1000 <= Date.now()) {
      throw new InvalidOrExpiredTokenError();
    }

    return payload as RefreshTokenClaims;
  }

  private async resolveActiveAppKeyId(): Promise<string> {
    if (!this.prisma.appKey) {
      return this.fallbackActiveAppKeyId;
    }

    const activeKey = await this.prisma.appKey.findFirst({
      where: { status: 'ACTIVE' },
    });
    return activeKey?.id ?? this.fallbackActiveAppKeyId;
  }
}
