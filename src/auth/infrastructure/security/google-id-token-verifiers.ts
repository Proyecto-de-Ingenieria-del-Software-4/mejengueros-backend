import {
  createPublicKey,
  createVerify,
  type JsonWebKey as CryptoJsonWebKey,
  type KeyLike,
} from 'node:crypto';
import {
  AuthInfrastructureError,
  InvalidOrExpiredTokenError,
} from '../../domain/exceptions';

type GoogleTokenPayload = {
  iss?: string;
  aud?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean;
  sub?: string;
};

type VerifyResult = {
  email: string;
  emailVerified: boolean;
  subject: string;
  audience: string;
};

type BaseConfig = {
  acceptedIssuers: string[];
};

type JwtHeader = {
  alg?: string;
  kid?: string;
};

type ParsedJwt = {
  signingInput: string;
  signature: Buffer;
  header: JwtHeader;
  payload: GoogleTokenPayload;
};

export type GoogleJwkSetResolver = {
  resolvePublicKey(kid: string): Promise<string | KeyLike | null>;
};

type JwkSetResponse = {
  keys?: Array<JsonWebKey & { kid?: string }>;
};

class GoogleHttpJwkSetResolver implements GoogleJwkSetResolver {
  private cache = new Map<string, string | KeyLike>();
  private loaded = false;

  async resolvePublicKey(kid: string): Promise<string | KeyLike | null> {
    if (this.cache.has(kid)) {
      return this.cache.get(kid) ?? null;
    }

    await this.loadKeys();
    return this.cache.get(kid) ?? null;
  }

  private async loadKeys(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!response.ok) {
      throw new AuthInfrastructureError();
    }

    const body = (await response.json()) as JwkSetResponse;
    for (const jwk of body.keys ?? []) {
      if (!jwk.kid) {
        continue;
      }
      this.cache.set(
        jwk.kid,
        createPublicKey({
          key: jwk as unknown as CryptoJsonWebKey,
          format: 'jwk',
        }),
      );
    }

    this.loaded = true;
  }
}

function parseJwt(token: string): ParsedJwt {
  const [rawHeader, rawPayload, rawSignature] = token.split('.');
  if (!rawHeader || !rawPayload || !rawSignature) {
    throw new InvalidOrExpiredTokenError();
  }

  const header = JSON.parse(
    Buffer.from(rawHeader, 'base64url').toString('utf8'),
  ) as JwtHeader;
  const payload = JSON.parse(
    Buffer.from(rawPayload, 'base64url').toString('utf8'),
  ) as GoogleTokenPayload;

  return {
    signingInput: `${rawHeader}.${rawPayload}`,
    signature: Buffer.from(rawSignature, 'base64url'),
    header,
    payload,
  };
}

function validatePayload(
  payload: GoogleTokenPayload,
  audiences: string[],
  config: BaseConfig,
): VerifyResult {
  if (!payload.aud || !audiences.includes(payload.aud)) {
    throw new InvalidOrExpiredTokenError();
  }

  if (!payload.iss || !config.acceptedIssuers.includes(payload.iss)) {
    throw new InvalidOrExpiredTokenError();
  }

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new InvalidOrExpiredTokenError();
  }

  if (!payload.email || !payload.sub) {
    throw new InvalidOrExpiredTokenError();
  }

  return {
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
    subject: payload.sub,
    audience: payload.aud,
  };
}

export class GoogleWebIdTokenVerifier {
  constructor(
    private readonly config: BaseConfig & {
      webClientIds: string[];
      jwkSetResolver?: GoogleJwkSetResolver;
    },
  ) {}

  async verify(idToken: string): Promise<VerifyResult> {
    try {
      const parsed = parseJwt(idToken);
      await verifyJwtSignature(
        parsed,
        this.config.jwkSetResolver ?? new GoogleHttpJwkSetResolver(),
      );

      return validatePayload(
        parsed.payload,
        this.config.webClientIds,
        this.config,
      );
    } catch (error) {
      if (error instanceof InvalidOrExpiredTokenError) {
        throw error;
      }
      throw new AuthInfrastructureError();
    }
  }
}

export class GoogleMobileIdTokenVerifier {
  constructor(
    private readonly config: BaseConfig & {
      mobileClientIds: string[];
      jwkSetResolver?: GoogleJwkSetResolver;
    },
  ) {}

  async verify(idToken: string): Promise<VerifyResult> {
    try {
      const parsed = parseJwt(idToken);
      await verifyJwtSignature(
        parsed,
        this.config.jwkSetResolver ?? new GoogleHttpJwkSetResolver(),
      );

      return validatePayload(
        parsed.payload,
        this.config.mobileClientIds,
        this.config,
      );
    } catch (error) {
      if (error instanceof InvalidOrExpiredTokenError) {
        throw error;
      }
      throw new AuthInfrastructureError();
    }
  }
}

async function verifyJwtSignature(
  parsed: ParsedJwt,
  resolver: GoogleJwkSetResolver,
): Promise<void> {
  if (parsed.header.alg !== 'RS256' || !parsed.header.kid) {
    throw new InvalidOrExpiredTokenError();
  }

  const key = await resolver.resolvePublicKey(parsed.header.kid);
  if (!key) {
    throw new InvalidOrExpiredTokenError();
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(parsed.signingInput);
  verifier.end();

  const valid = verifier.verify(key, parsed.signature);
  if (!valid) {
    throw new InvalidOrExpiredTokenError();
  }
}
