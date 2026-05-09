import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AccountLockedError,
  AuthDomainError,
  EmailVerificationRequiredError,
  ForbiddenAuthActionError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidOrExpiredTokenError,
  RefreshTokenReuseDetectedError,
  UserNotFoundError,
} from '../../domain/exceptions';

export const mapAuthErrorToHttpException = (error: unknown): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  if (error instanceof InvalidCredentialsError) {
    return new UnauthorizedException('INVALID_CREDENTIALS');
  }

  if (error instanceof EmailVerificationRequiredError) {
    return new ForbiddenException('EMAIL_VERIFICATION_REQUIRED');
  }

  if (error instanceof AccountLockedError) {
    return new HttpException('ACCOUNT_LOCKED', HttpStatus.LOCKED);
  }

  if (error instanceof InvalidOrExpiredTokenError) {
    return new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
  }

  if (error instanceof InvalidRefreshTokenError) {
    return new UnauthorizedException('INVALID_REFRESH_TOKEN');
  }

  if (error instanceof RefreshTokenReuseDetectedError) {
    return new UnauthorizedException('REFRESH_TOKEN_REUSE_DETECTED');
  }

  if (error instanceof ForbiddenAuthActionError) {
    return new ForbiddenException('FORBIDDEN');
  }

  if (error instanceof UserNotFoundError) {
    return new ForbiddenException('FORBIDDEN');
  }

  if (!(error instanceof AuthDomainError)) {
    return new InternalServerErrorException();
  }

  return new InternalServerErrorException();
};
