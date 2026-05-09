import { AUTH_EVENT_NAMES } from './auth-events.constants';
import { registerAuthEventListeners } from './auth-events.listeners';
import type { DomainEventBus } from './domain-event-bus.contract';
import type { DomainEvent } from './domain-event.contract';

class DomainEventBusSpy implements DomainEventBus {
  subscriptions: Array<{
    name: string;
    handler: (event: DomainEvent<unknown>) => Promise<void>;
  }> = [];

  subscribe<TPayload>(
    eventName: string,
    handler: (event: DomainEvent<TPayload>) => Promise<void>,
  ): void {
    this.subscriptions.push({
      name: eventName,
      handler: handler,
    });
  }

  async publish(): Promise<void> {
    return Promise.resolve();
  }
}

describe('registerAuthEventListeners', () => {
  it('registers verification and password-reset listeners', () => {
    const eventBus = new DomainEventBusSpy();

    registerAuthEventListeners({
      eventBus,
      sendAuthEmail: async () => {
        return Promise.resolve();
      },
    });

    expect(
      eventBus.subscriptions.map((subscription) => subscription.name),
    ).toEqual([
      AUTH_EVENT_NAMES.USER_REGISTERED,
      AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
    ]);
  });

  it('maps event payloads to expected auth email templates', async () => {
    const sent: Array<{ template: string; to: string }> = [];
    const eventBus = new DomainEventBusSpy();

    registerAuthEventListeners({
      eventBus,
      sendAuthEmail: async (command) => {
        sent.push({ template: command.template, to: command.to });
      },
    });

    await eventBus.subscriptions[0].handler({
      name: AUTH_EVENT_NAMES.USER_REGISTERED,
      occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      payload: {
        userId: 'user-1',
        email: 'registered@example.com',
        username: 'tester',
      },
    });

    await eventBus.subscriptions[1].handler({
      name: AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
      occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      payload: {
        userId: 'user-1',
        email: 'registered@example.com',
        resetToken: 'opaque-reset-token',
      },
    });

    expect(sent).toEqual([
      { template: 'auth.verify-email', to: 'registered@example.com' },
      { template: 'auth.password-reset', to: 'registered@example.com' },
    ]);
  });
});
