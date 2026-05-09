import { createHash, createHmac, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { TokenKeyManagement } from './token-key-management.contract';

const DEFAULT_TOKEN_BYTES = 48;
const JWT_LIKE_SECRET = 'local-dev-jwt-like-secret';

@Injectable()
export class TokenKeyManagementService implements TokenKeyManagement {
  generateOpaqueToken(size = DEFAULT_TOKEN_BYTES): string {
    return randomBytes(size).toString('base64url');
  }

  fingerprint(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  signJwtLike(payload: Record<string, unknown>): string {
    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', JWT_LIKE_SECRET)
      .update(encodedPayload)
      .digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  verifyJwtLike(token: string): Record<string, unknown> {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      throw new Error('INVALID_TOKEN_FORMAT');
    }

    const expectedSignature = createHmac('sha256', JWT_LIKE_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (expectedSignature !== signature) {
      throw new Error('INVALID_TOKEN_SIGNATURE');
    }

    return JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
  }
}
