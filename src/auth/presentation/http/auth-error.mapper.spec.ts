import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  InvalidCredentialsError,
  UsernameAlreadyExistsError,
} from '../../domain/exceptions';
import { mapAuthErrorToHttpException } from './auth-error.mapper';

describe('mapAuthErrorToHttpException', () => {
  it('maps auth domain errors preserving code/status/message', () => {
    const exception = mapAuthErrorToHttpException(
      new InvalidCredentialsError(),
    );

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(exception.getResponse()).toEqual({
      code: 'auth/invalid-credentials',
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid credentials',
    });
  });

  it('maps conflict domain errors preserving semantic code', () => {
    const exception = mapAuthErrorToHttpException(
      new UsernameAlreadyExistsError(),
    );

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(exception.getResponse()).toEqual({
      code: 'auth/username-already-in-use',
      status: HttpStatus.CONFLICT,
      message: 'Username already exists',
    });
  });

  it('returns existing HttpException instances unchanged', () => {
    const existing = new UnauthorizedException('already-mapped');

    expect(mapAuthErrorToHttpException(existing)).toBe(existing);
  });

  it('falls back to internal server error for unknown errors', () => {
    const exception = mapAuthErrorToHttpException(new Error('unexpected'));

    expect(exception).toBeInstanceOf(InternalServerErrorException);
  });
});
