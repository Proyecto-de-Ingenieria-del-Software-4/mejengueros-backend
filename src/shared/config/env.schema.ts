import { z } from 'zod';

const envBoolean = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 14),
  AUTH_PASSWORD_MIN_LENGTH: z.coerce.number().int().min(8).default(12),
  AUTH_PASSWORD_REQUIRE_UPPERCASE: envBoolean.default(true),
  AUTH_PASSWORD_REQUIRE_LOWERCASE: envBoolean.default(true),
  AUTH_PASSWORD_REQUIRE_NUMBER: envBoolean.default(true),
  AUTH_PASSWORD_REQUIRE_SYMBOL: envBoolean.default(false),
  AUTH_ACTIVE_APP_KEY_ID: z.string().min(1).default('app-key-active'),
  AUTH_GOOGLE_ACCEPTED_ISSUERS: z
    .string()
    .default('accounts.google.com,https://accounts.google.com'),
  AUTH_GOOGLE_WEB_CLIENT_IDS: z.string().default('google-web-client-id'),
  AUTH_GOOGLE_MOBILE_CLIENT_IDS: z.string().default('google-mobile-client-id'),
});

export type AppConfig = {
  databaseUrl: string;
  port: number;
  jwt: {
    accessTtlSeconds: number;
    refreshTtlSeconds: number;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
  };
  auth: {
    activeAppKeyId: string;
    google: {
      acceptedIssuers: string[];
      webClientIds: string[];
      mobileClientIds: string[];
    };
  };
};

function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function parseAppConfigEnv(env: Record<string, unknown>): AppConfig {
  const parsed = envSchema.parse(env);

  return {
    databaseUrl: parsed.DATABASE_URL,
    port: parsed.PORT,
    jwt: {
      accessTtlSeconds: parsed.JWT_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: parsed.JWT_REFRESH_TTL_SECONDS,
    },
    passwordPolicy: {
      minLength: parsed.AUTH_PASSWORD_MIN_LENGTH,
      requireUppercase: parsed.AUTH_PASSWORD_REQUIRE_UPPERCASE,
      requireLowercase: parsed.AUTH_PASSWORD_REQUIRE_LOWERCASE,
      requireNumber: parsed.AUTH_PASSWORD_REQUIRE_NUMBER,
      requireSymbol: parsed.AUTH_PASSWORD_REQUIRE_SYMBOL,
    },
    auth: {
      activeAppKeyId: parsed.AUTH_ACTIVE_APP_KEY_ID,
      google: {
        acceptedIssuers: toList(parsed.AUTH_GOOGLE_ACCEPTED_ISSUERS),
        webClientIds: toList(parsed.AUTH_GOOGLE_WEB_CLIENT_IDS),
        mobileClientIds: toList(parsed.AUTH_GOOGLE_MOBILE_CLIENT_IDS),
      },
    },
  };
}
