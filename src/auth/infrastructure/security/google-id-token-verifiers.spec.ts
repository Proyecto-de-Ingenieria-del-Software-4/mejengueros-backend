import {
  InvalidOrExpiredTokenError,
  AuthInfrastructureError,
} from '../../domain/exceptions';
import {
  type GoogleJwkSetResolver,
  GoogleMobileIdTokenVerifier,
  GoogleWebIdTokenVerifier,
} from './google-id-token-verifiers';
import { createSign, generateKeyPairSync } from 'node:crypto';

describe('Google id token verifiers', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  const resolver: GoogleJwkSetResolver = {
    resolvePublicKey: async (kid: string) => {
      if (kid !== 'kid-1') {
        return null;
      }
      return publicKey.export({ format: 'pem', type: 'spki' }).toString();
    },
  };

  const createToken = (claims: Record<string, unknown>, kid = 'kid-1') => {
    const header = { alg: 'RS256', typ: 'JWT', kid };
    const encodedHeader = Buffer.from(JSON.stringify(header), 'utf8').toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(claims), 'utf8').toString(
      'base64url',
    );
    const data = `${encodedHeader}.${encodedPayload}`;
    const signer = createSign('RSA-SHA256');
    signer.update(data);
    signer.end();
    const signature = signer.sign(privateKey).toString('base64url');
    return `${data}.${signature}`;
  };

  it('accepts web tokens for allowed audience and issuer', async () => {
    const token = createToken({
      iss: 'https://accounts.google.com',
      aud: 'client-web',
      exp: Math.floor(Date.now() / 1000) + 120,
      email: 'user@example.com',
      email_verified: true,
      sub: 'google-subject',
    });

    const verifier = new GoogleWebIdTokenVerifier({
      webClientIds: ['client-web'],
      acceptedIssuers: ['accounts.google.com', 'https://accounts.google.com'],
      jwkSetResolver: resolver,
    });

    await expect(verifier.verify(token)).resolves.toEqual(
      expect.objectContaining({
        email: 'user@example.com',
        subject: 'google-subject',
      }),
    );
  });

  it('rejects mobile token with invalid audience', async () => {
    const token = createToken({
      iss: 'https://accounts.google.com',
      aud: 'client-web',
      exp: Math.floor(Date.now() / 1000) + 120,
      email: 'user@example.com',
      email_verified: true,
      sub: 'google-subject',
    });

    const verifier = new GoogleMobileIdTokenVerifier({
      mobileClientIds: ['client-mobile'],
      acceptedIssuers: ['accounts.google.com', 'https://accounts.google.com'],
      jwkSetResolver: resolver,
    });

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });

  it('rejects token with invalid signature', async () => {
    const validToken = createToken({
      iss: 'https://accounts.google.com',
      aud: 'client-web',
      exp: Math.floor(Date.now() / 1000) + 120,
      email: 'user@example.com',
      email_verified: true,
      sub: 'google-subject',
    });
    const tamperedToken = `${validToken.slice(0, -2)}aa`;

    const verifier = new GoogleWebIdTokenVerifier({
      webClientIds: ['client-web'],
      acceptedIssuers: ['accounts.google.com', 'https://accounts.google.com'],
      jwkSetResolver: resolver,
    });

    await expect(verifier.verify(tamperedToken)).rejects.toBeInstanceOf(
      InvalidOrExpiredTokenError,
    );
  });

  it('maps jwks fetch failures to infrastructure-safe auth error', async () => {
    const token = createToken({
      iss: 'https://accounts.google.com',
      aud: 'client-web',
      exp: Math.floor(Date.now() / 1000) + 120,
      email: 'user@example.com',
      email_verified: true,
      sub: 'google-subject',
    });

    const failingResolver: GoogleJwkSetResolver = {
      resolvePublicKey: async () => {
        throw new Error('network_down');
      },
    };

    const verifier = new GoogleWebIdTokenVerifier({
      webClientIds: ['client-web'],
      acceptedIssuers: ['accounts.google.com', 'https://accounts.google.com'],
      jwkSetResolver: failingResolver,
    });

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(
      AuthInfrastructureError,
    );
  });
});
