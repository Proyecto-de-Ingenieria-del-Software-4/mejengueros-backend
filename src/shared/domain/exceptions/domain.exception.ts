import { HttpStatusCode } from '../enums/http-status-code.enum';
import type { ApiErrorDetail } from '../interfaces/api-response.interface';

export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: HttpStatusCode;

  readonly details?: ApiErrorDetail[];
  readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      details?: ApiErrorDetail[];
      metadata?: Record<string, unknown>;
      cause?: unknown;
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.details = options?.details;
    this.metadata = options?.metadata;
  }
}
