import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InvalidOrExpiredTokenError } from '../../domain/exceptions';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('attaches user context from bearer token', () => {
    const guard = new JwtAuthGuard({
      verifyAccessToken: jest.fn(() => ({
        sub: 'u1',
        roles: ['ADMIN'],
        sid: 's1',
      })),
    } as never);

    const request: Record<string, any> = {
      headers: { authorization: 'Bearer token-1' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => null,
      getClass: () => null,
    };

    expect(guard.canActivate(context as never)).toBe(true);
    expect(request.user).toEqual({
      userId: 'u1',
      roles: ['ADMIN'],
      sessionId: 's1',
    });
  });

  it('rejects missing bearer token', () => {
    const guard = new JwtAuthGuard({ verifyAccessToken: jest.fn() });
    const request = { headers: {} };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => null,
      getClass: () => null,
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      UnauthorizedException,
    );
  });

  it('maps token verification domain errors to unauthorized http error', () => {
    const guard = new JwtAuthGuard({
      verifyAccessToken: jest.fn(() => {
        throw new InvalidOrExpiredTokenError();
      }),
    });
    const request = { headers: { authorization: 'Bearer invalid-token' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => null,
      getClass: () => null,
    };

    try {
      guard.canActivate(context as never);
      fail('Expected guard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.UNAUTHORIZED,
      );
      expect((error as HttpException).getResponse()).toEqual({
        code: 'auth/invalid-or-expired-token',
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired token',
      });
    }
  });
});
