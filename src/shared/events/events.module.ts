import { Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import type { AuthEmailService } from '../email/email.service.contract';
import type { DomainEventBus } from './domain-event-bus.contract';
import { registerAuthEventListeners } from './auth-events.listeners';
import { InMemoryAsyncEventBusService } from './in-memory-async-event-bus.service';
import { SharedEmailModule } from '../email/email.module';

class AuthEventListenerBootstrap implements OnModuleInit {
  constructor(
    @Inject(SHARED_TOKENS.DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,
    @Inject(SHARED_TOKENS.AUTH_EMAIL_SERVICE)
    private readonly authEmailService: AuthEmailService,
  ) {}

  onModuleInit(): void {
    registerAuthEventListeners({
      eventBus: this.eventBus,
      sendAuthEmail: (command) => this.authEmailService.send(command),
    });
  }
}

@Global()
@Module({
  imports: [SharedEmailModule],
  providers: [
    InMemoryAsyncEventBusService,
    {
      provide: SHARED_TOKENS.DOMAIN_EVENT_BUS,
      useExisting: InMemoryAsyncEventBusService,
    },
    AuthEventListenerBootstrap,
  ],
  exports: [SHARED_TOKENS.DOMAIN_EVENT_BUS, InMemoryAsyncEventBusService],
})
export class SharedEventsModule {}
