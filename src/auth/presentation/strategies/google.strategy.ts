import { Injectable } from '@nestjs/common';
import {
  GoogleMobileIdTokenVerifier,
  GoogleWebIdTokenVerifier,
} from '../../infrastructure/security/google-id-token-verifiers';

@Injectable()
export class GoogleStrategy {
  constructor(
    private readonly webVerifier: GoogleWebIdTokenVerifier,
    private readonly mobileVerifier: GoogleMobileIdTokenVerifier,
  ) {}

  verifyWeb(idToken: string) {
    return this.webVerifier.verify(idToken);
  }

  verifyMobile(idToken: string) {
    return this.mobileVerifier.verify(idToken);
  }
}
