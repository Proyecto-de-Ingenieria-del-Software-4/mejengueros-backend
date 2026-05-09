import { Module } from '@nestjs/common';
import { SharedConfigModule } from './shared/config/config.module';
import { SharedSecurityModule } from './shared/security/security.module';
import { SharedPersistenceModule } from './shared/persistence/persistence.module';
import { SharedEmailModule } from './shared/email/email.module';
import { SharedEventsModule } from './shared/events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    SharedConfigModule,
    SharedSecurityModule,
    SharedPersistenceModule,
    SharedEmailModule,
    SharedEventsModule,
    AuthModule,
  ],
})
export class AppModule {}
