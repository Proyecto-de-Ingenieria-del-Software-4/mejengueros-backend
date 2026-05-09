import type { AuthenticateWithGoogleMobileDependencies } from '../contracts';
import type { GoogleAuthCommand, GoogleAuthResult } from '../dto';
import { resolveGoogleAuthPolicy } from './google-auth-policy';

export class AuthenticateWithGoogleMobileUseCase {
  constructor(
    private readonly deps: AuthenticateWithGoogleMobileDependencies,
  ) {}

  async execute(command: GoogleAuthCommand): Promise<GoogleAuthResult> {
    const verified = await this.deps.googleAuthVerifier.verifyMobile(
      command.idToken,
    );
    return resolveGoogleAuthPolicy(this.deps, verified);
  }
}
