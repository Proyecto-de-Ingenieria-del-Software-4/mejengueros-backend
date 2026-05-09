import { AUTH_EVENT_NAMES } from './auth-events.constants';
import { InMemoryAsyncEventBusService } from './in-memory-async-event-bus.service';

describe('InMemoryAsyncEventBusService', () => {
  it('publishes auth events asynchronously without blocking publish path', async () => {
    const eventBus = new InMemoryAsyncEventBusService();
    const received: string[] = [];

    eventBus.subscribe(AUTH_EVENT_NAMES.USER_REGISTERED, async () => {
      received.push('listener-ran');
    });

    await eventBus.publish({
      name: AUTH_EVENT_NAMES.USER_REGISTERED,
      occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      payload: {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'tester',
      },
    });

    expect(received).toEqual([]);

    await new Promise((resolve) => setImmediate(resolve));

    expect(received).toEqual(['listener-ran']);
  });

  it('supports multiple listeners for same auth event', async () => {
    const eventBus = new InMemoryAsyncEventBusService();
    const received: string[] = [];

    eventBus.subscribe(AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED, async () => {
      received.push('listener-1');
    });

    eventBus.subscribe(AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED, async () => {
      received.push('listener-2');
    });

    await eventBus.publish({
      name: AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED,
      occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      payload: {
        userId: 'user-1',
        email: 'test@example.com',
        resetToken: 'opaque-token',
      },
    });

    await new Promise((resolve) => setImmediate(resolve));

    expect(received).toEqual(['listener-1', 'listener-2']);
  });
});
