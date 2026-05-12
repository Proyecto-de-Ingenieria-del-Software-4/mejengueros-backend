import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestWithRequestId = Request & {
  id?: string;
};

export function getRequestIdFromHeader(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function ensureRequestId(
  request: RequestWithRequestId,
  response?: Response,
): string {
  const requestId =
    request.id ??
    getRequestIdFromHeader(request.headers[REQUEST_ID_HEADER]) ??
    randomUUID();

  response?.setHeader('X-Request-Id', requestId);

  return requestId;
}
