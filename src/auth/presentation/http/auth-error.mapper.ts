import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AccountLockedError,
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
  UserNotFoundError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions';

export const mapAuthErrorToHttpException = (error: unknown): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  if (error instanceof InvalidCredentialsError) {
    return new UnauthorizedException('INVALID_CREDENTIALS');
  }

  if (error instanceof InvalidAuthIdentifierError) {
    return new UnauthorizedException('INVALID_AUTH_IDENTIFIER');
  }

  if (error instanceof UsernameAlreadyExistsError) {
    return new ConflictException('USERNAME_ALREADY_EXISTS');
  }

  if (error instanceof EmailAlreadyExistsError) {
    return new ConflictException('EMAIL_ALREADY_EXISTS');
  }

  if (error instanceof PasswordPolicyFailedError) {
    return new HttpException('PASSWORD_POLICY_FAILED', HttpStatus.BAD_REQUEST);
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

  if (error instanceof AuthBaselineNotReadyError) {
    return new ServiceUnavailableException('AUTH_BASELINE_NOT_READY');
  }

  if (error instanceof AuthInfrastructureError) {
    return new ServiceUnavailableException('AUTH_SERVICE_UNAVAILABLE');
  }

  if (!(error instanceof AuthDomainError)) {
    return new InternalServerErrorException();
  }

  return new InternalServerErrorException();
};
