import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAccessTokenVerifierService } from '../../infrastructure/security/jwt-access-token-verifier.service';
import type { AccessTokenVerifier } from '../../infrastructure/security/contracts';
import { mapAuthErrorToHttpException } from '../http/auth-error.mapper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtAccessTokenVerifierService)
    private readonly verifier: AccessTokenVerifier,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers?: Record<string, string>; user?: unknown }>();
    const header = request.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('AUTH_REQUIRED');
    }

    const token = header.slice('Bearer '.length).trim();
    let payload: ReturnType<AccessTokenVerifier['verifyAccessToken']>;
    try {
      payload = this.verifier.verifyAccessToken(token);
    } catch (error) {
      throw mapAuthErrorToHttpException(error);
    }
    request.user = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sid,
    };
    return true;
  }
}
