import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthDomainError,
  EmailVerificationRequiredError,
  ForbiddenAuthActionError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidOrExpiredTokenError,
  RefreshTokenReuseDetectedError,
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
});
