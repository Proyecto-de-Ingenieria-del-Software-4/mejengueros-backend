import { InvalidOrExpiredTokenError } from '../../domain/exceptions';
import { JwtAccessTokenVerifierService } from './jwt-access-token-verifier.service';

describe('JwtAccessTokenVerifierService', () => {
  const createService = (payload: unknown) =>
    new JwtAccessTokenVerifierService({
      verifyJwtLike: jest.fn(() => payload),
    } as never);

  it('returns typed access token payload when token claims are valid', () => {
    const service = createService({
      sub: 'user-1',
      roles: ['USER'],
      sid: 'session-1',
      typ: 'access',
      exp: Math.floor(Date.now() / 1000) + 120,
    });

    expect(service.verifyAccessToken('token')).toEqual({
      sub: 'user-1',
      roles: ['USER'],
      sid: 'session-1',
    });
  });

  it('throws typed domain error when token claims shape is invalid', () => {
    const service = createService({
      sub: 'user-1',
      roles: ['USER'],
      sid: 'session-1',
      typ: 'refresh',
      exp: Math.floor(Date.now() / 1000) + 120,
    });

    expect(() => service.verifyAccessToken('token')).toThrow(
      InvalidOrExpiredTokenError,
    );
  });

  it('throws typed domain error when access token is expired', () => {
    const service = createService({
      sub: 'user-1',
      roles: ['USER'],
      sid: 'session-1',
      typ: 'access',
      exp: Math.floor(Date.now() / 1000) - 10,
    });

    expect(() => service.verifyAccessToken('token')).toThrow(
      InvalidOrExpiredTokenError,
    );
  });
});
