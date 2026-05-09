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
    expect(error.message).toBe('Invalid local auth identifier: !bad');
  });

  it('defines typed errors for canonical auth failures', () => {
    expect(new InvalidCredentialsError().message).toBe('INVALID_CREDENTIALS');
    expect(new EmailVerificationRequiredError().message).toBe(
      'EMAIL_VERIFICATION_REQUIRED',
    );
    expect(new InvalidOrExpiredTokenError().message).toBe(
      'INVALID_OR_EXPIRED_TOKEN',
    );
    expect(new AccountLockedError().message).toBe('ACCOUNT_LOCKED');
  });

  it('exports the remaining auth domain typed errors through barrel', () => {
    expect(new UsernameAlreadyExistsError().message).toBe(
      'USERNAME_ALREADY_EXISTS',
    );
    expect(new EmailAlreadyExistsError().message).toBe('EMAIL_ALREADY_EXISTS');
    expect(new PasswordPolicyFailedError().message).toBe(
      'PASSWORD_POLICY_FAILED',
    );
    expect(new UserNotFoundError().message).toBe('USER_NOT_FOUND');
    expect(new ForbiddenAuthActionError().message).toBe('FORBIDDEN');
  });
});
