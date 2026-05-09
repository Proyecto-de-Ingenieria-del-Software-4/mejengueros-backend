import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUserContext } from '../http/auth-user-context';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserContext => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUserContext }>();
    return request.user ?? { userId: '', role: 'USER' };
  },
);
