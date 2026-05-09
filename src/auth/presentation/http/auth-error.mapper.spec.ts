import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthBaselineNotReadyError,
  AuthDomainError,
  AuthInfrastructureError,
  EmailAlreadyExistsError,
  EmailVerificationRequiredError,
  ForbiddenAuthActionError,
  InvalidAuthIdentifierError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidOrExpiredTokenError,
  PasswordPolicyFailedError,
  RefreshTokenReuseDetectedError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions';
import { mapAuthErrorToHttpException } from './auth-error.mapper';

describe('mapAuthErrorToHttpException', () => {
  it('maps invalid credentials to unauthorized', () => {
    const exception = mapAuthErrorToHttpException(
      new InvalidCredentialsError(),
    );

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect(exception.message).toBe('INVALID_CREDENTIALS');
  });

  it('maps invalid auth identifier to unauthorized', () => {
    const exception = mapAuthErrorToHttpException(
      new InvalidAuthIdentifierError('bad'),
    );

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect(exception.message).toBe('INVALID_AUTH_IDENTIFIER');
  });

  it('maps username already exists to conflict', () => {
    const exception = mapAuthErrorToHttpException(
      new UsernameAlreadyExistsError(),
    );

    expect(exception).toBeInstanceOf(ConflictException);
    expect(exception.message).toBe('USERNAME_ALREADY_EXISTS');
  });

  it('maps email already exists to conflict', () => {
    const exception = mapAuthErrorToHttpException(
      new EmailAlreadyExistsError(),
    );

    expect(exception).toBeInstanceOf(ConflictException);
    expect(exception.message).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('maps password policy failed to bad request', () => {
    const exception = mapAuthErrorToHttpException(
      new PasswordPolicyFailedError(),
    );

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.message).toBe('PASSWORD_POLICY_FAILED');
  });

  it('maps email verification required to forbidden', () => {
    const exception = mapAuthErrorToHttpException(
      new EmailVerificationRequiredError(),
    );

    expect(exception).toBeInstanceOf(ForbiddenException);
    expect(exception.message).toBe('EMAIL_VERIFICATION_REQUIRED');
  });

  it('maps invalid-or-expired token to unauthorized', () => {
    const exception = mapAuthErrorToHttpException(
      new InvalidOrExpiredTokenError(),
    );

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect(exception.message).toBe('INVALID_OR_EXPIRED_TOKEN');
  });

  it('maps invalid refresh token to unauthorized', () => {
    const exception = mapAuthErrorToHttpException(
      new InvalidRefreshTokenError(),
    );

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect(exception.message).toBe('INVALID_REFRESH_TOKEN');
  });

  it('maps refresh token reuse detected to unauthorized', () => {
    const exception = mapAuthErrorToHttpException(
      new RefreshTokenReuseDetectedError(),
    );

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect(exception.message).toBe('REFRESH_TOKEN_REUSE_DETECTED');
  });

  it('maps forbidden auth action to forbidden exception', () => {
    const exception = mapAuthErrorToHttpException(
      new ForbiddenAuthActionError(),
    );

    expect(exception).toBeInstanceOf(ForbiddenException);
    expect(exception.message).toBe('FORBIDDEN');
  });

  it('does not fallback legacy forbidden string anymore', () => {
    const exception = mapAuthErrorToHttpException(
      new AuthDomainError('FORBIDDEN'),
    );

    expect(exception).toBeInstanceOf(InternalServerErrorException);
  });

  it('does not fallback legacy invalid credentials string anymore', () => {
    const exception = mapAuthErrorToHttpException(
      new AuthDomainError('INVALID_CREDENTIALS'),
    );

    expect(exception).toBeInstanceOf(InternalServerErrorException);
  });

  it('maps auth baseline not ready to service unavailable', () => {
    const exception = mapAuthErrorToHttpException(
      new AuthBaselineNotReadyError(),
    );

    expect(exception).toBeInstanceOf(ServiceUnavailableException);
    expect(exception.message).toBe('AUTH_BASELINE_NOT_READY');
  });

  it('maps auth infrastructure errors to service unavailable', () => {
    const exception = mapAuthErrorToHttpException(
      new AuthInfrastructureError(),
    );

    expect(exception).toBeInstanceOf(ServiceUnavailableException);
    expect(exception.message).toBe('AUTH_SERVICE_UNAVAILABLE');
  });
});
