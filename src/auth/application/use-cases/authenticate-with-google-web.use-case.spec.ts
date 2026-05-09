import { AuthenticateWithGoogleWebUseCase } from './authenticate-with-google-web.use-case';
import { createAuthUserStub } from '../../test-support/create-auth-user.stub';

describe('AuthenticateWithGoogleWebUseCase', () => {
  it('returns conflict when existing user is unverified', async () => {
    const useCase = new AuthenticateWithGoogleWebUseCase({
      googleAuthVerifier: {
        verifyWeb: async () => ({
          email: 'player1@example.com',
          emailVerified: true,
          subject: 'google-subject',
        }),
      },
      userRepository: {
        findByEmail: async () => createAuthUserStub({ emailVerified: false }),
      },
    });

    await expect(useCase.execute({ idToken: 'web-token' })).resolves.toEqual({
      allowed: false,
      reason: 'GOOGLE_LINK_CONFLICT',
    });
  });

  it('returns ready response when identity can link', async () => {
    const useCase = new AuthenticateWithGoogleWebUseCase({
      googleAuthVerifier: {
        verifyWeb: async () => ({
          email: 'player1@example.com',
          emailVerified: true,
          subject: 'google-subject',
        }),
      },
      userRepository: {
        findByEmail: async () => null,
      },
    });

    await expect(useCase.execute({ idToken: 'web-token' })).resolves.toEqual({
      allowed: true,
      reason: 'GOOGLE_AUTH_READY',
      email: 'player1@example.com',
      subject: 'google-subject',
    });
  });
});
