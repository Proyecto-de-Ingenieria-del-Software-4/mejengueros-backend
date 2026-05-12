import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { SharedConfigModule } from './shared/config/config.module';
import { SharedSecurityModule } from './shared/security/security.module';
import { SharedPersistenceModule } from './shared/persistence/persistence.module';
import { SharedEmailModule } from './shared/email/email.module';
import { SharedEventsModule } from './shared/events/events.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  REQUEST_ID_HEADER,
  getRequestIdFromHeader,
} from './shared/http/request-id';

type RequestWithClientIp = IncomingMessage & {
  id?: string;
  ip?: string;
};

@Module({
  controllers: [HealthController],
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        genReqId: (req: IncomingMessage, res: ServerResponse) => {
          const headerValue = getRequestIdFromHeader(
            req.headers[REQUEST_ID_HEADER],
          );

          if (headerValue) {
            res.setHeader('X-Request-Id', headerValue);
            return headerValue;
          }

          const requestId = randomUUID();
          res.setHeader('X-Request-Id', requestId);
          return requestId;
        },
        customProps: (req: RequestWithClientIp) => ({
          requestId: req.id,
          clientIp: req.ip ?? req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        }),
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) {
            return 'error';
          }

          if (res.statusCode >= 400) {
            return 'warn';
          }

          return 'info';
        },
        customSuccessMessage: (req, res) =>
          `${req.method} ${req.url} completed with ${String(res.statusCode)}`,
        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} failed with ${String(res.statusCode)}: ${err.message}`,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers.set-cookie',
            'request.headers.authorization',
            'request.headers.cookie',
            'request.headers.set-cookie',
          ],
          censor: '[Redacted]',
        },
      },
    }),
    SharedConfigModule,
    SharedSecurityModule,
    SharedPersistenceModule,
    SharedEmailModule,
    SharedEventsModule,
    AuthModule,
  ],
})
export class AppModule {}
