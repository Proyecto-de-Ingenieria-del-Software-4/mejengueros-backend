import type { DomainEvent } from './domain-event.contract';

export interface DomainEventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(
    eventName: string,
    handler: (event: DomainEvent<TPayload>) => Promise<void>,
  ): void;
}
