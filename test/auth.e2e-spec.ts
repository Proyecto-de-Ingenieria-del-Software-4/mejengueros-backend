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
      .expect({
        message: 'EMAIL_VERIFICATION_REQUIRED',
        error: 'Forbidden',
        statusCode: 403,
      });
  });

  it('returns locked status for lockout window', async () => {
    authApplication.loginLocal?.mockRejectedValue(new AccountLockedError());

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'player1', password: 'bad' })
      .expect(423)
      .expect({
        message: 'ACCOUNT_LOCKED',
        statusCode: 423,
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
      .expect({
        message: 'REFRESH_TOKEN_REUSE_DETECTED',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  it('enforces auth guard on protected endpoint', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
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
      .expect({
        id: 'user-1',
        username: 'player1',
        email: 'player1@example.com',
        role: 'USER',
        emailVerified: true,
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
      .expect({
        allowed: false,
        reason: 'GOOGLE_LINK_CONFLICT',
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
      .expect({
        allowed: true,
        reason: 'GOOGLE_AUTH_READY',
        email: 'google@example.com',
        subject: 'google-subject',
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
      .expect({ verified: true });

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: 'verify-token' })
      .expect(401)
      .expect({
        message: 'INVALID_OR_EXPIRED_TOKEN',
        error: 'Unauthorized',
        statusCode: 401,
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
      .expect({
        message: 'INVALID_REFRESH_TOKEN',
        error: 'Unauthorized',
        statusCode: 401,
      });
  });
});
