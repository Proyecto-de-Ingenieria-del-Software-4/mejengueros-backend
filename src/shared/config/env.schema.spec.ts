import { parseAppConfigEnv } from './env.schema';

describe('parseAppConfigEnv', () => {
  it('parses and normalizes a valid environment payload', () => {
    const parsed = parseAppConfigEnv({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/mejengueros',
      PORT: '4000',
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '2592000',
      AUTH_PASSWORD_MIN_LENGTH: '12',
      AUTH_PASSWORD_REQUIRE_UPPERCASE: 'true',
      AUTH_PASSWORD_REQUIRE_LOWERCASE: 'true',
      AUTH_PASSWORD_REQUIRE_NUMBER: 'true',
      AUTH_PASSWORD_REQUIRE_SYMBOL: 'false',
    });

    expect(parsed.port).toBe(4000);
    expect(parsed.passwordPolicy.requireSymbol).toBe(false);
    expect(parsed.jwt.accessTtlSeconds).toBe(900);
  });

  it('fails when DATABASE_URL is missing', () => {
    expect(() =>
      parseAppConfigEnv({
        PORT: '4000',
        JWT_ACCESS_TTL_SECONDS: '900',
        JWT_REFRESH_TTL_SECONDS: '2592000',
      }),
    ).toThrow('DATABASE_URL');
  });
});
