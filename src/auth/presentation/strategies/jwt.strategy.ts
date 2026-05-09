import { Injectable } from '@nestjs/common';
import { JwtAccessTokenVerifierService } from '../../infrastructure/security/jwt-access-token-verifier.service';

@Injectable()
export class JwtStrategy {
  constructor(private readonly verifier: JwtAccessTokenVerifierService) {}

  validate(accessToken: string) {
    return this.verifier.verifyAccessToken(accessToken);
  }
}
