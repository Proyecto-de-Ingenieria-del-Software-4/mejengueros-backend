import { AuthenticateWithGoogleMobileUseCase } from './authenticate-with-google-mobile.use-case';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';

describe('AuthenticateWithGoogleMobileUseCase', () => {
  it('returns conflict when google identity is not verified', async () => {
    const useCase = new AuthenticateWithGoogleMobileUseCase({
      googleAuthVerifier: {
        verifyMobile: async () => ({
          email: 'player1@example.com',
          emailVerified: false,
          subject: 'google-subject',
        }),
      },
      userRepository: {
        findByEmail: async () => createAuthUserStub(),
      },
    });

    await expect(useCase.execute({ idToken: 'mobile-token' })).resolves.toEqual(
      {
        allowed: false,
        reason: 'GOOGLE_LINK_CONFLICT',
      },
    );
  });

  it('returns ready response when identity can link', async () => {
    const useCase = new AuthenticateWithGoogleMobileUseCase({
      googleAuthVerifier: {
        verifyMobile: async () => ({
          email: 'player1@example.com',
          emailVerified: true,
          subject: 'google-subject',
        }),
      },
      userRepository: {
        findByEmail: async () => createAuthUserStub(),
      },
    });

    await expect(useCase.execute({ idToken: 'mobile-token' })).resolves.toEqual(
      {
        allowed: true,
        reason: 'GOOGLE_AUTH_READY',
        email: 'player1@example.com',
        subject: 'google-subject',
      },
    );
  });
});
