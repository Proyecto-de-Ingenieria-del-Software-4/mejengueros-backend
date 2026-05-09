import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import { AppConfigService } from './app-config.service';
import { parseAppConfigEnv } from './env.schema';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: SHARED_TOKENS.APP_CONFIG,
      useFactory: () => parseAppConfigEnv(process.env),
    },
    AppConfigService,
  ],
  exports: [AppConfigService, SHARED_TOKENS.APP_CONFIG],
})
export class SharedConfigModule {}
