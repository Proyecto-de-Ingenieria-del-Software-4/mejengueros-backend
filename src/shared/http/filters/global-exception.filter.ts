import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import type {
  ApiErrorDetail,
  ApiErrorResponse,
} from '../../domain/interfaces/api-response.interface';

const STATUS_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'validation/failed',
  [HttpStatus.UNAUTHORIZED]: 'auth/unauthorized',
  [HttpStatus.FORBIDDEN]: 'auth/forbidden',
  [HttpStatus.NOT_FOUND]: 'resource/not-found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'request/method-not-allowed',
  [HttpStatus.CONFLICT]: 'resource/conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'validation/unprocessable',
  [HttpStatus.TOO_MANY_REQUESTS]: 'request/too-many-requests',
  [HttpStatus.LOCKED]: 'auth/locked',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'server/internal-error',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'server/unavailable',
};

const FALLBACK_ERROR_CODE = 'server/unknown';
const VALIDATION_FAILED_MESSAGE = 'Validation failed';
const INTERNAL_ERROR_MESSAGE = 'Internal server error';
const ERROR_LOG_STATUS_THRESHOLD = 500;

type ExtractedHttpError = {
  code?: string;
  message: string;
  details?: ApiErrorDetail[];
  metadata?: Record<string, unknown>;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? randomUUID();
    const path = request.originalUrl.split('?')[0];

    if (exception instanceof DomainException) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      const cause =
        exception instanceof Error && 'cause' in exception
          ? exception.cause
          : undefined;
      const body: ApiErrorResponse = {
        success: false,
        error: {
          code: exception.code,
          status: exception.httpStatus,
          message: exception.message,
          ...(exception.details?.length && { details: exception.details }),
          ...(exception.metadata && { metadata: exception.metadata }),
        },
        meta: {
          timestamp: new Date().toISOString(),
          path,
          method: request.method,
          requestId,
        },
      };

      const logLine =
        `[${exception.code}] ${exception.message} (${String(exception.httpStatus)}) | ` +
        `${request.method} ${request.originalUrl} | requestId=${requestId}`;

      const logContext = JSON.stringify({
        ...(exception.metadata ? { metadata: exception.metadata } : {}),
        ...(cause
          ? {
              cause:
                cause instanceof Error
                  ? cause.message
                  : typeof cause === 'string'
                    ? cause
                    : 'Non-Error cause',
            }
          : {}),
      });

      if (Number(exception.httpStatus) >= ERROR_LOG_STATUS_THRESHOLD) {
        this.logger.error(logLine, stack);
        if (logContext !== '{}') {
          this.logger.error(logContext);
        }
      } else {
        this.logger.warn(
          logContext === '{}' ? logLine : `${logLine} ${logContext}`,
        );
      }

      response.status(exception.httpStatus).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const extracted = this.extractMessageAndDetails(exceptionResponse);
      const code =
        extracted.code ?? STATUS_CODE_MAP[status] ?? FALLBACK_ERROR_CODE;

      const body: ApiErrorResponse = {
        success: false,
        error: {
          code,
          status,
          message: extracted.message,
          ...(extracted.details?.length && { details: extracted.details }),
          ...(extracted.metadata && { metadata: extracted.metadata }),
        },
        meta: {
          timestamp: new Date().toISOString(),
          path,
          method: request.method,
          requestId,
        },
      };

      const logLine = `[${code}] ${extracted.message} (${String(status)}) | ${request.method} ${request.originalUrl} | requestId=${requestId}`;
      if (Number(status) >= ERROR_LOG_STATUS_THRESHOLD) {
        this.logger.error(logLine);
      } else {
        this.logger.warn(logLine);
      }

      response.status(status).json(body);
      return;
    }

    this.logger.error(
      `Unhandled exception | ${request.method} ${request.originalUrl} | requestId=${requestId}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: STATUS_CODE_MAP[HttpStatus.INTERNAL_SERVER_ERROR],
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: INTERNAL_ERROR_MESSAGE,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path,
        method: request.method,
        requestId,
      },
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }

  private extractMessageAndDetails(
    response: string | object,
  ): ExtractedHttpError {
    if (typeof response === 'string') {
      return { message: response };
    }

    const payload = response as Record<string, unknown>;

    if (
      typeof payload.code === 'string' &&
      typeof payload.message === 'string'
    ) {
      return {
        code: payload.code,
        message: payload.message,
        ...(Array.isArray(payload.details) && {
          details: payload.details as ApiErrorDetail[],
        }),
        ...(payload.metadata && typeof payload.metadata === 'object'
          ? { metadata: payload.metadata as Record<string, unknown> }
          : {}),
      };
    }

    const message = payload.message;

    if (Array.isArray(message)) {
      const details = (message as string[]).map((item) => {
        const firstSpace = item.indexOf(' ');
        const target = firstSpace > 0 ? item.slice(0, firstSpace) : 'unknown';
        const code = item
          .slice(firstSpace + 1)
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_|_$/g, '');

        return {
          code,
          target,
          message: item,
        };
      });

      return {
        message: VALIDATION_FAILED_MESSAGE,
        details,
      };
    }

    if (typeof message === 'string') {
      return { message };
    }

    return { message: INTERNAL_ERROR_MESSAGE };
  }
}
