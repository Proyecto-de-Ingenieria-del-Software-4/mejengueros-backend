import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './shared/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);
  await app.listen(appConfigService.port);
}
void bootstrap().catch((error: unknown) => {
  console.error('BOOTSTRAP_ERROR', error);
  process.exit(1);
});
