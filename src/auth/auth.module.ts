import { Module } from '@nestjs/common';
import { AuthController } from './presentation/http/auth.controller';
import { SharedConfigModule } from '../shared/config/config.module';
import { SharedSecurityModule } from '../shared/security/security.module';
import { SharedPersistenceModule } from '../shared/persistence/persistence.module';
import { SharedEventsModule } from '../shared/events/events.module';
import { AuthApplicationModule } from './application/auth-application.module';
import { AuthInfrastructureModule } from './infrastructure/auth-infrastructure.module';

@Module({
  imports: [
    SharedConfigModule,
    SharedSecurityModule,
    SharedPersistenceModule,
    SharedEventsModule,
    AuthApplicationModule,
    AuthInfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
