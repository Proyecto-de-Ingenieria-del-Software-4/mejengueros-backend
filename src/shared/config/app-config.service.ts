import { Inject, Injectable } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import type { AppConfig } from './env.schema';

@Injectable()
export class AppConfigService {
  constructor(
    @Inject(SHARED_TOKENS.APP_CONFIG)
    private readonly appConfig: AppConfig,
  ) {}

  get databaseUrl(): string {
    return this.appConfig.databaseUrl;
  }

  get port(): number {
    return this.appConfig.port;
  }

  get passwordPolicy(): AppConfig['passwordPolicy'] {
    return this.appConfig.passwordPolicy;
  }

  get activeAppKeyId(): string {
    return this.appConfig.auth.activeAppKeyId;
  }

  get googleConfig(): AppConfig['auth']['google'] {
    return this.appConfig.auth.google;
  }
}
