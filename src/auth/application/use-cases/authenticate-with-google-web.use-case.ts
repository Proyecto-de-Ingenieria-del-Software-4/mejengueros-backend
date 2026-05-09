import type { AuthenticateWithGoogleWebDependencies } from '../contracts';
import type { GoogleAuthCommand, GoogleAuthResult } from '../dto';
import { resolveGoogleAuthPolicy } from './google-auth-policy';

export class AuthenticateWithGoogleWebUseCase {
  constructor(private readonly deps: AuthenticateWithGoogleWebDependencies) {}

  async execute(command: GoogleAuthCommand): Promise<GoogleAuthResult> {
    const verified = await this.deps.googleAuthVerifier.verifyWeb(
      command.idToken,
    );
    return resolveGoogleAuthPolicy(this.deps, verified);
  }
}
