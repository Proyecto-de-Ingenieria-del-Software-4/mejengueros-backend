import type { UserRepository } from '../../domain/repositories/user.repository';
import type { GoogleAuthVerifier } from '../../domain/services/google-auth-verifier.service';

export type AuthenticateWithGoogleWebDependencies = {
  userRepository: Pick<UserRepository, 'findByEmail'>;
  googleAuthVerifier: Pick<GoogleAuthVerifier, 'verifyWeb'>;
};
