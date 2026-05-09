import { Injectable } from '@nestjs/common';
import { InvalidOrExpiredTokenError } from '../../domain/exceptions';
import { TokenKeyManagementService } from '../../../shared/security/tokens/token-key-management.service';
import type {
  AccessTokenClaims,
  AccessTokenVerifier,
  VerifiedAccessToken,
} from './contracts';

@Injectable()
export class JwtAccessTokenVerifierService implements AccessTokenVerifier {
  constructor(private readonly tokenKeyManagement: TokenKeyManagementService) {}

  verifyAccessToken(token: string): VerifiedAccessToken {
    const payload = this.tokenKeyManagement.verifyJwtLike(
      token,
    ) as Partial<AccessTokenClaims>;
    if (
      !payload.sub ||
      !payload.sid ||
      (payload.role !== 'USER' && payload.role !== 'ADMIN') ||
      payload.typ !== 'access' ||
      typeof payload.exp !== 'number'
    ) {
      throw new InvalidOrExpiredTokenError();
    }

    if (payload.exp * 1000 <= Date.now()) {
      throw new InvalidOrExpiredTokenError();
    }

    return { sub: payload.sub, role: payload.role, sid: payload.sid };
  }
}
