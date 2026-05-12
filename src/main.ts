import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/http/filters/global-exception.filter';
import { TransformInterceptor } from './shared/http/interceptors/transform.interceptor';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const logger = app.get(Logger);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(
    new LoggerErrorInterceptor(),
    new TransformInterceptor(),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  const appConfigService = app.get(AppConfigService);
  await app.listen(appConfigService.port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap().catch((error: unknown) => {
  console.error('BOOTSTRAP_ERROR', error);
  process.exit(1);
});
