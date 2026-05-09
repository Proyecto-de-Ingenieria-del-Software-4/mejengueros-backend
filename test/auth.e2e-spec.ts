import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/presentation/http/auth.controller';
import { JwtAuthGuard } from '../src/auth/presentation/guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../src/auth/presentation/guards/google-auth.guard';
import { AUTH_TOKENS } from '../src/auth/domain/constants/injection-tokens';
import {
  AccountLockedError,
  EmailVerificationRequiredError,
  InvalidOrExpiredTokenError,
  InvalidRefreshTokenError,
  RefreshTokenReuseDetectedError,
} from '../src/auth/domain/exceptions';
import { JwtAccessTokenVerifierService } from '../src/auth/infrastructure/security/jwt-access-token-verifier.service';
import { GlobalExceptionFilter } from '../src/shared/http/filters/global-exception.filter';
import { LoggingInterceptor } from '../src/shared/http/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/shared/http/interceptors/transform.interceptor';

describe('AuthController HTTP flows (integration)', () => {
  let app: INestApplication<App>;

  const authApplication = {
    loginLocal: jest.fn(),
    refreshToken: jest.fn(),
    verifyEmail: jest.fn(),
    logout: jest.fn(),
    getCurrentProfile: jest.fn(),
    authenticateWithGoogleWeb: jest.fn(),
  } as Record<string, jest.Mock>;

  beforeEach(async () => {
    Object.values(authApplication).forEach((mockFn) => mockFn?.mockReset());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AUTH_TOKENS.LOGIN_LOCAL_USE_CASE,
          useValue: { execute: authApplication.loginLocal },
        },
        {
          provide: AUTH_TOKENS.REFRESH_TOKEN_USE_CASE,
          useValue: { execute: authApplication.refreshToken },
        },
        {
          provide: AUTH_TOKENS.LOGOUT_USE_CASE,
          useValue: { execute: authApplication.logout },
        },
        {
          provide: AUTH_TOKENS.VERIFY_EMAIL_USE_CASE,
          useValue: { execute: authApplication.verifyEmail },
        },
        {
          provide: AUTH_TOKENS.GET_CURRENT_PROFILE_USE_CASE,
          useValue: { execute: authApplication.getCurrentProfile },
        },
        {
          provide: AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_WEB_USE_CASE,
          useValue: { execute: authApplication.authenticateWithGoogleWeb },
        },
        {
          provide: AUTH_TOKENS.REGISTER_LOCAL_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_TOKENS.RESEND_VERIFICATION_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_TOKENS.REQUEST_PASSWORD_RESET_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_TOKENS.RESET_PASSWORD_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_MOBILE_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AUTH_TOKENS.UPDATE_USER_ROLE_USE_CASE,
          useValue: { execute: jest.fn() },
        },
        {
          provide: JwtAccessTokenVerifierService,
          useValue: {
            verifyAccessToken: jest.fn((token: string) => {
              if (token === 'allow') {
                return { sub: 'user-1', role: 'USER', sid: 'sid-1' };
              }

              throw new UnauthorizedException('AUTH_REQUIRED');
            }),
          },
        },
        JwtAuthGuard,
        GoogleAuthGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('blocks local login when email is unverified', async () => {
    authApplication.loginLocal?.mockRejectedValue(
      new EmailVerificationRequiredError(),
    );

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'player1', password: 'bad' })
      .expect(403)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/email-verification-required',
          status: 403,
          message: 'Email verification is required',
        });
        expect(response.body.meta).toMatchObject({
          path: '/auth/login',
          method: 'POST',
        });
        expect(typeof response.body.meta.timestamp).toBe('string');
        expect(typeof response.body.meta.requestId).toBe('string');
      });
  });

  it('returns locked status for lockout window', async () => {
    authApplication.loginLocal?.mockRejectedValue(new AccountLockedError());

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'player1', password: 'bad' })
      .expect(423)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/account-locked',
          status: 423,
          message: 'Account is temporarily locked',
        });
      });
  });

  it('rejects refresh token reuse through endpoint flow', async () => {
    authApplication.refreshToken?.mockRejectedValue(
      new RefreshTokenReuseDetectedError(),
    );

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'stolen-token' })
      .expect(401)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/refresh-token-reuse-detected',
          status: 401,
          message: 'Refresh token reuse detected',
        });
      });
  });

  it('enforces auth guard on protected endpoint', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/unauthorized',
          status: 401,
          message: 'AUTH_REQUIRED',
        });
      });
  });

  it('returns sanitized profile on protected endpoint with valid auth', async () => {
    authApplication.getCurrentProfile?.mockResolvedValue({
      id: 'user-1',
      username: 'player1',
      email: 'player1@example.com',
      role: 'USER',
      emailVerified: true,
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('authorization', 'Bearer allow')
      .expect(200)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          id: 'user-1',
          username: 'player1',
          email: 'player1@example.com',
          role: 'USER',
          emailVerified: true,
        });
        expect(response.body.meta).toMatchObject({
          path: '/auth/me',
          method: 'GET',
        });
        expect(typeof response.body.meta.timestamp).toBe('string');
        expect(typeof response.body.meta.requestId).toBe('string');
      });
  });

  it('supports representative google web endpoint behavior', async () => {
    authApplication.authenticateWithGoogleWeb?.mockResolvedValue({
      allowed: false,
      reason: 'GOOGLE_LINK_CONFLICT',
    });

    await request(app.getHttpServer())
      .post('/auth/google/web')
      .send({ idToken: 'google-token' })
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          allowed: false,
          reason: 'GOOGLE_LINK_CONFLICT',
        });
        expect(response.body.meta).toMatchObject({
          path: '/auth/google/web',
          method: 'POST',
        });
      });
  });

  it('returns success path for google web auth when allowed', async () => {
    authApplication.authenticateWithGoogleWeb?.mockResolvedValue({
      allowed: true,
      reason: 'GOOGLE_AUTH_READY',
      email: 'google@example.com',
      subject: 'google-subject',
    });

    await request(app.getHttpServer())
      .post('/auth/google/web')
      .send({ idToken: 'google-token-success' })
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          allowed: true,
          reason: 'GOOGLE_AUTH_READY',
          email: 'google@example.com',
          subject: 'google-subject',
        });
        expect(response.body.meta).toMatchObject({
          path: '/auth/google/web',
          method: 'POST',
        });
      });
  });

  it('redeems email verification once and rejects second redemption', async () => {
    let redeemed = false;
    authApplication.verifyEmail?.mockImplementation(async () => {
      if (redeemed) {
        throw new InvalidOrExpiredTokenError();
      }
      redeemed = true;
      return { verified: true };
    });

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: 'verify-token' })
      .expect(201)
      .expect((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({ verified: true });
        expect(response.body.meta).toMatchObject({
          path: '/auth/verify-email',
          method: 'POST',
        });
      });

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: 'verify-token' })
      .expect(401)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/invalid-or-expired-token',
          status: 401,
          message: 'Invalid or expired token',
        });
      });
  });

  it('denies refresh after logout revokes the same session', async () => {
    const revokedSessions = new Set<string>();
    authApplication.logout?.mockImplementation(async ({ sessionId }) => {
      revokedSessions.add(sessionId as string);
    });
    authApplication.refreshToken?.mockImplementation(
      async ({ refreshToken }) => {
        if (revokedSessions.has(refreshToken as string)) {
          throw new InvalidRefreshTokenError();
        }

        return {
          accessToken: 'access-2',
          refreshToken: 'refresh-2',
          refreshSessionId: 'session-2',
          refreshFamilyId: 'family-1',
        };
      },
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ sessionId: 'session-1' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'session-1' })
      .expect(401)
      .expect((response) => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toMatchObject({
          code: 'auth/invalid-refresh-token',
          status: 401,
          message: 'Invalid refresh token',
        });
      });
  });
});
