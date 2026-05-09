import { createHmac } from 'node:crypto';
import {
  AuthBaselineNotReadyError,
  InvalidOrExpiredTokenError,
  InvalidRefreshTokenError,
  RefreshTokenReuseDetectedError,
} from '../../domain/exceptions';
import { RefreshTokenIssuerAdapter } from './refresh-token-issuer.adapter';

describe('RefreshTokenIssuerAdapter', () => {
  const secret = 'test-refresh-secret';

  const build = () => {
    type RefreshSessionRecord = {
      id: string;
      userId: string;
      tokenHash: string;
      tokenFamily: string;
      version: number;
      appKeyId: string;
      expiresAt: Date;
      revokedAt: Date | null;
    };

    type RefreshSessionFindWhere = {
      id?: string;
      tokenHash?: string;
      revokedAt?: { not: null };
    };

    const sessions = new Map<string, RefreshSessionRecord>();

    const prisma = {
      appKey: {
        findFirst: jest.fn(
          async ({ where }: { where?: { status?: string } }) => {
            if (where?.status === 'ACTIVE') {
              return { id: 'active-key-1', status: 'ACTIVE' };
            }
            return null;
          },
        ),
      },
      refreshSession: {
        create: jest.fn(async ({ data }: { data: RefreshSessionRecord }) => {
          sessions.set(data.id, { ...data, revokedAt: null });
        }),
        findFirst: jest.fn(
          async ({ where }: { where: RefreshSessionFindWhere }) => {
            if (where.id) {
              return sessions.get(where.id) ?? null;
            }

            if (where.tokenHash && where.revokedAt?.not === null) {
              return (
                [...sessions.values()].find(
                  (item) =>
                    item.tokenHash === where.tokenHash && item.revokedAt,
                ) ?? null
              );
            }

            if (where.tokenHash) {
              return (
                [...sessions.values()].find(
                  (item) =>
                    item.tokenHash === where.tokenHash && !item.revokedAt,
                ) ?? null
              );
            }

            return null;
          },
        ),
        updateMany: jest.fn(
          async ({
            where,
            data,
          }: {
            where: { tokenFamily: string };
            data: { revokedAt: Date };
          }) => {
            for (const value of sessions.values()) {
              if (value.tokenFamily === where.tokenFamily && !value.revokedAt) {
                value.revokedAt = data.revokedAt;
              }
            }
            return { count: 1 };
          },
        ),
        update: jest.fn(
          async ({
            where,
            data,
          }: {
            where: { id: string };
            data: Partial<RefreshSessionRecord>;
          }) => {
            const current = sessions.get(where.id);
            if (current) {
              sessions.set(where.id, { ...current, ...data });
            }
          },
        ),
      },
      user: {
        findUnique: jest.fn(async ({ where }: { where: { id: string } }) => ({
          id: where.id,
          tokenVersion: 2,
        })),
      },
    };

    const tokenKeyManagement = {
      generateOpaqueToken: jest.fn(() => 'opaque-token'),
      fingerprint: jest.fn((value: string) =>
        createHmac('sha256', 'fingerprint-secret').update(value).digest('hex'),
      ),
      signJwtLike: jest.fn((payload: Record<string, unknown>) => {
        const encodedPayload = Buffer.from(
          JSON.stringify(payload),
          'utf8',
        ).toString('base64url');
        const signature = createHmac('sha256', secret)
          .update(encodedPayload)
          .digest('base64url');
        return `${encodedPayload}.${signature}`;
      }),
      verifyJwtLike: jest.fn((token: string) => {
        const [encodedPayload, signature] = token.split('.');
        const expected = createHmac('sha256', secret)
          .update(encodedPayload)
          .digest('base64url');
        if (signature !== expected) {
          throw new InvalidOrExpiredTokenError();
        }

        return JSON.parse(
          Buffer.from(encodedPayload, 'base64url').toString('utf8'),
        );
      }),
    };

    return {
      service: new RefreshTokenIssuerAdapter(prisma, tokenKeyManagement),
      sessions,
      prisma,
    };
  };

  it('issues refresh tokens with explicit claims', async () => {
    const { service } = build();

    const issued = await service.issueForUser('user-1', 2);
    const payload = service.parseTokenUnsafe(issued.refreshToken);

    expect(payload.sub).toBe('user-1');
    expect(payload.sid).toBe(issued.refreshSessionId);
    expect(payload.tv).toBe(2);
    expect(payload.typ).toBe('refresh');
    expect(payload.akid).toBe('active-key-1');
  });

  it('fails when no active app key exists', async () => {
    const { service, prisma } = build();
    prisma.appKey.findFirst = jest.fn(
      async (_args: {
        where?: { status?: string };
      }): Promise<{ id: string; status: string } | null> => {
        void _args;
        return null;
      },
    );

    await expect(service.issueForUser('user-1', 2)).rejects.toMatchObject({
      code: 'auth/baseline-not-ready',
      metadata: {
        source: 'auth/token-issuer',
        operation: 'resolve-active-app-key',
        reason: 'active-app-key-missing',
      },
    } satisfies Partial<AuthBaselineNotReadyError>);
  });

  it('revokes family and fails when refresh token is reused', async () => {
    const { service, sessions } = build();
    const issued = await service.issueForUser('user-1', 2);

    await service.rotateRefreshToken(issued.refreshToken);

    await expect(
      service.rotateRefreshToken(issued.refreshToken),
    ).rejects.toBeInstanceOf(RefreshTokenReuseDetectedError);
    expect([...sessions.values()].every((item) => item.revokedAt)).toBe(true);
  });

  it('fails with invalid refresh token when stored version mismatches token claims', async () => {
    const { service, sessions } = build();
    const issued = await service.issueForUser('user-1', 2);

    const current = sessions.get(issued.refreshSessionId);
    if (current) {
      current.version = 3;
    }

    await expect(
      service.rotateRefreshToken(issued.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('fails with invalid refresh token when app key mismatches token claims', async () => {
    const { service, sessions } = build();
    const issued = await service.issueForUser('user-1', 2);

    const current = sessions.get(issued.refreshSessionId);
    if (current) {
      current.appKeyId = 'another-active-key';
    }

    await expect(
      service.rotateRefreshToken(issued.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
