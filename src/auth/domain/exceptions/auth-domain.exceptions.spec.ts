import {
  AccountLockedError,
  AuthDomainError,
  EmailAlreadyExistsError,
  EmailVerificationRequiredError,
  ForbiddenAuthActionError,
  InvalidAuthIdentifierError,
  InvalidCredentialsError,
  InvalidOrExpiredTokenError,
  PasswordPolicyFailedError,
  UsernameAlreadyExistsError,
  UserNotFoundError,
} from '.';

describe('auth domain exceptions', () => {
  it('keeps InvalidAuthIdentifierError behavior for malformed identifiers', () => {
    const error = new InvalidAuthIdentifierError('!bad');

    expect(error).toBeInstanceOf(AuthDomainError);
    expect(error.code).toBe('auth/invalid-auth-identifier');
    expect(error.httpStatus).toBe(401);
    expect(error.message).toBe('Invalid local auth identifier: !bad');
  });

  it('defines typed errors for canonical auth failures', () => {
    expect(new InvalidCredentialsError().code).toBe('auth/invalid-credentials');
    expect(new InvalidCredentialsError().httpStatus).toBe(401);
    expect(new InvalidCredentialsError().message).toBe('Invalid credentials');
    expect(new EmailVerificationRequiredError().message).toBe(
      'Email verification is required',
    );
    expect(new EmailVerificationRequiredError().code).toBe(
      'auth/email-verification-required',
    );
    expect(new InvalidOrExpiredTokenError().message).toBe(
      'Invalid or expired token',
    );
    expect(new AccountLockedError().message).toBe(
      'Account is temporarily locked',
    );
  });

  it('exports the remaining auth domain typed errors through barrel', () => {
    expect(new UsernameAlreadyExistsError().code).toBe(
      'auth/username-already-in-use',
    );
    expect(new EmailAlreadyExistsError().code).toBe(
      'auth/email-already-in-use',
    );
    expect(new PasswordPolicyFailedError().message).toBe(
      'Password policy validation failed',
    );
    expect(new UserNotFoundError().code).toBe('auth/user-not-found');
    expect(new ForbiddenAuthActionError().message).toBe(
      'Forbidden authentication action',
    );
  });
});
