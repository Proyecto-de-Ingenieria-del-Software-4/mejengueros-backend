import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const appConfigService = app.get(AppConfigService);
  await app.listen(appConfigService.port);
}
void bootstrap().catch((error: unknown) => {
  console.error('BOOTSTRAP_ERROR', error);
  process.exit(1);
});
