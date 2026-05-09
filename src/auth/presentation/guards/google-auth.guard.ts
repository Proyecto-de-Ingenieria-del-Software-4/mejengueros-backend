import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ body?: { idToken?: string } }>();
    if (!request.body?.idToken) {
      throw new UnauthorizedException('GOOGLE_ID_TOKEN_REQUIRED');
    }

    return true;
  }
}
