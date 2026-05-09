import { Injectable } from '@nestjs/common';
import type { DomainEventBus } from './domain-event-bus.contract';
import type { DomainEvent } from './domain-event.contract';

type DomainEventHandler = (event: DomainEvent<unknown>) => Promise<void>;

@Injectable()
export class InMemoryAsyncEventBusService implements DomainEventBus {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  subscribe<TPayload>(
    eventName: string,
    handler: (event: DomainEvent<TPayload>) => Promise<void>,
  ): void {
    const current = this.handlers.get(eventName) ?? [];
    current.push(handler);
    this.handlers.set(eventName, current);
  }

  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];

    setImmediate(() => {
      for (const handler of handlers) {
        void handler(event);
      }
    });

    return Promise.resolve();
  }
}
