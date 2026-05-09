import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('allows when route has no role metadata', () => {
    const reflector = { getAllAndOverride: jest.fn(() => undefined) };
    const guard = new RolesGuard(reflector as never);

    const context = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'USER' } }) }),
    };

    expect(guard.canActivate(context as never)).toBe(true);
  });

  it('blocks when user role is not allowed', () => {
    const reflector = { getAllAndOverride: jest.fn(() => ['ADMIN']) };
    const guard = new RolesGuard(reflector as unknown as Reflector);

    const context = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'USER' } }) }),
    };

    expect(() => guard.canActivate(context as never)).toThrow(
      ForbiddenException,
    );
  });
});
