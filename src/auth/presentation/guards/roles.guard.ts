import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<
      Array<'USER' | 'ADMIN'>
    >(AUTH_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const role = request.user?.role;
    if (!role || !allowedRoles.includes(role as 'USER' | 'ADMIN')) {
      throw new ForbiddenException('FORBIDDEN');
    }

    return true;
  }
}
