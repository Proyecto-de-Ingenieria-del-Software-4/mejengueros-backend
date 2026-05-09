import type { GoogleAuthPolicyDependencies } from '../contracts';
import type { GoogleAuthResult } from '../dto';
import type { GoogleIdentity } from '../../domain/services/google-auth-verifier.service';

export const resolveGoogleAuthPolicy = async (
  deps: GoogleAuthPolicyDependencies,
  verified: GoogleIdentity,
): Promise<GoogleAuthResult> => {
  const existing = await deps.userRepository.findByEmail(
    verified.email.trim().toLowerCase(),
  );

  if (existing && (!existing.emailVerified || !verified.emailVerified)) {
    return { allowed: false, reason: 'GOOGLE_LINK_CONFLICT' };
  }

  return {
    allowed: true,
    reason: 'GOOGLE_AUTH_READY',
    email: verified.email,
    subject: verified.subject,
  };
};
