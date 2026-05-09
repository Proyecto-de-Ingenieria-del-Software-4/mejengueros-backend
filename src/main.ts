import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/http/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
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
