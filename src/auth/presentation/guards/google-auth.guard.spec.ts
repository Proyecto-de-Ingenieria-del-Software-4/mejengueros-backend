import { UnauthorizedException } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';

describe('GoogleAuthGuard', () => {
  it('allows request with idToken', () => {
    const guard = new GoogleAuthGuard();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ body: { idToken: 'token' } }),
      }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('rejects request without idToken', () => {
    const guard = new GoogleAuthGuard();
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ body: {} }) }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      UnauthorizedException,
    );
  });
});
