import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const makeController = (overrides?: Record<string, jest.Mock>) => {
    const loginUseCase = { execute: jest.fn(), ...overrides };
    const refreshUseCase = { execute: jest.fn(), ...overrides };
    const logoutUseCase = { execute: jest.fn(), ...overrides };
    const registerUseCase = { execute: jest.fn(), ...overrides };
    const verifyEmailUseCase = { execute: jest.fn(), ...overrides };
    const resendVerificationUseCase = { execute: jest.fn(), ...overrides };
    const requestPasswordResetUseCase = { execute: jest.fn(), ...overrides };
    const resetPasswordUseCase = { execute: jest.fn(), ...overrides };
    const googleWebUseCase = { execute: jest.fn(), ...overrides };
    const googleMobileUseCase = { execute: jest.fn(), ...overrides };
    const getCurrentProfileUseCase = { execute: jest.fn(), ...overrides };
    const updateUserRoleUseCase = { execute: jest.fn(), ...overrides };

    return {
      controller: new AuthController(
        loginUseCase as never,
        refreshUseCase as never,
        logoutUseCase as never,
        registerUseCase as never,
        verifyEmailUseCase as never,
        resendVerificationUseCase as never,
        requestPasswordResetUseCase as never,
        resetPasswordUseCase as never,
        googleWebUseCase as never,
        googleMobileUseCase as never,
        getCurrentProfileUseCase as never,
        updateUserRoleUseCase as never,
      ),
      loginUseCase,
      refreshUseCase,
      logoutUseCase,
      registerUseCase,
      verifyEmailUseCase,
      resendVerificationUseCase,
      requestPasswordResetUseCase,
      resetPasswordUseCase,
      googleWebUseCase,
      googleMobileUseCase,
      getCurrentProfileUseCase,
      updateUserRoleUseCase,
    };
  };

  it('maps register requests to register-local use case', async () => {
    const { controller, registerUseCase } = makeController();
    registerUseCase.execute.mockResolvedValue({
      user: {
        id: 'user-2',
        username: 'newbie',
        email: 'newbie@example.com',
        role: 'USER',
        emailVerified: false,
      },
      tokens: {
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      },
    });

    await expect(
      controller.register({
        username: 'newbie',
        email: 'newbie@example.com',
        password: 'StrongPass123!',
      }),
    ).resolves.toEqual({
      user: {
        id: 'user-2',
        username: 'newbie',
        email: 'newbie@example.com',
        role: 'USER',
        emailVerified: false,
      },
      tokens: {
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      },
    });
    expect(registerUseCase.execute).toHaveBeenCalledWith({
      username: 'newbie',
      email: 'newbie@example.com',
      password: 'StrongPass123!',
    });
  });

  it('maps verify-email requests to verify-email use case', async () => {
    const { controller, verifyEmailUseCase } = makeController();
    verifyEmailUseCase.execute.mockResolvedValue({ verified: true });

    await expect(
      controller.verifyEmail({ token: 'verify-token' }),
    ).resolves.toEqual({
      verified: true,
    });
    expect(verifyEmailUseCase.execute).toHaveBeenCalledWith({
      token: 'verify-token',
    });
  });

  it('maps resend-verification requests to resend use case', async () => {
    const { controller, resendVerificationUseCase } = makeController();
    resendVerificationUseCase.execute.mockResolvedValue({ accepted: true });

    await expect(
      controller.resendVerification({ email: 'player1@example.com' }),
    ).resolves.toEqual({ accepted: true });
    expect(resendVerificationUseCase.execute).toHaveBeenCalledWith({
      email: 'player1@example.com',
    });
  });

  it('returns sanitized profile from application service', async () => {
    const { controller, getCurrentProfileUseCase } = makeController();
    getCurrentProfileUseCase.execute.mockResolvedValue({
      id: 'user-1',
      username: 'player1',
      email: 'player1@example.com',
      role: 'USER',
      emailVerified: true,
    });

    await expect(
      controller.me({ userId: 'user-1', role: 'USER' }),
    ).resolves.toEqual({
      id: 'user-1',
      username: 'player1',
      email: 'player1@example.com',
      role: 'USER',
      emailVerified: true,
    });
    expect(getCurrentProfileUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });
  });

  it('maps refresh requests to application refresh flow', async () => {
    const { controller, refreshUseCase } = makeController();
    refreshUseCase.execute.mockResolvedValue({
      accessToken: 'a1',
      refreshToken: 'r1',
      refreshSessionId: 's1',
      refreshFamilyId: 'f1',
    });

    await expect(
      controller.refresh({ refreshToken: 'refresh-token' }),
    ).resolves.toEqual({
      accessToken: 'a1',
      refreshToken: 'r1',
      refreshSessionId: 's1',
      refreshFamilyId: 'f1',
    });
    expect(refreshUseCase.execute).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
    });
  });

  it('maps login requests to login use case', async () => {
    const { controller, loginUseCase } = makeController();
    loginUseCase.execute.mockResolvedValue({
      user: { id: 'user-1', role: 'USER' },
      tokens: {
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      },
    });

    await expect(
      controller.login({ identifier: 'player1', password: 'Valid123!' }),
    ).resolves.toEqual({
      user: { id: 'user-1', role: 'USER' },
      tokens: {
        accessToken: 'a1',
        refreshToken: 'r1',
        refreshSessionId: 's1',
        refreshFamilyId: 'f1',
      },
    });
    expect(loginUseCase.execute).toHaveBeenCalledWith({
      identifier: 'player1',
      password: 'Valid123!',
    });
  });

  it('maps logout requests to logout use case', async () => {
    const { controller, logoutUseCase } = makeController();
    logoutUseCase.execute.mockResolvedValue(undefined);

    await expect(controller.logout({ sessionId: 'session-1' })).resolves.toBe(
      undefined,
    );
    expect(logoutUseCase.execute).toHaveBeenCalledWith({
      sessionId: 'session-1',
    });
  });

  it('maps google web auth requests to application flow', async () => {
    const { controller, googleWebUseCase } = makeController();
    googleWebUseCase.execute.mockResolvedValue({
      allowed: false,
      reason: 'GOOGLE_LINK_CONFLICT',
    });

    await expect(
      controller.googleWeb({ idToken: 'web-token' }),
    ).resolves.toEqual({
      allowed: false,
      reason: 'GOOGLE_LINK_CONFLICT',
    });
    expect(googleWebUseCase.execute).toHaveBeenCalledWith({
      idToken: 'web-token',
    });
  });

  it('maps request-password-reset requests to dedicated use case', async () => {
    const { controller, requestPasswordResetUseCase } = makeController();
    requestPasswordResetUseCase.execute.mockResolvedValue({ accepted: true });

    await expect(
      controller.requestPasswordReset({ email: 'player1@example.com' }),
    ).resolves.toEqual({ accepted: true });
    expect(requestPasswordResetUseCase.execute).toHaveBeenCalledWith({
      email: 'player1@example.com',
    });
  });

  it('maps reset-password requests to dedicated use case', async () => {
    const { controller, resetPasswordUseCase } = makeController();
    resetPasswordUseCase.execute.mockResolvedValue(undefined);

    await expect(
      controller.resetPassword({ token: 't1', newPassword: 'StrongPass123!' }),
    ).resolves.toBeUndefined();
    expect(resetPasswordUseCase.execute).toHaveBeenCalledWith({
      token: 't1',
      newPassword: 'StrongPass123!',
    });
  });

  it('maps google mobile auth requests to application flow', async () => {
    const { controller, googleMobileUseCase } = makeController();
    googleMobileUseCase.execute.mockResolvedValue({
      allowed: true,
      reason: 'GOOGLE_AUTH_READY',
    });

    await expect(
      controller.googleMobile({ idToken: 'mobile-token' }),
    ).resolves.toEqual({
      allowed: true,
      reason: 'GOOGLE_AUTH_READY',
    });
    expect(googleMobileUseCase.execute).toHaveBeenCalledWith({
      idToken: 'mobile-token',
    });
  });

  it('maps role update requests to dedicated use case', async () => {
    const { controller, updateUserRoleUseCase } = makeController();
    updateUserRoleUseCase.execute.mockResolvedValue(undefined);

    await expect(
      controller.updateRole({ userId: 'admin-1', role: 'ADMIN' }, 'user-2', {
        role: 'USER',
      }),
    ).resolves.toBeUndefined();

    expect(updateUserRoleUseCase.execute).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      targetUserId: 'user-2',
      role: 'USER',
    });
  });
});
