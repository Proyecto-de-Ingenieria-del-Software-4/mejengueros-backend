import { AUTH_EMAIL_TEMPLATES } from '../email/email.constants';
import type { SendAuthEmailCommand } from '../email/email.service.contract';
import { AUTH_EVENT_NAMES } from './auth-events.constants';
import type { DomainEventBus } from './domain-event-bus.contract';

type RegisterAuthEventListenersInput = {
  eventBus: DomainEventBus;
  sendAuthEmail: (command: SendAuthEmailCommand) => Promise<void>;
};

export function registerAuthEventListeners(
  input: RegisterAuthEventListenersInput,
): void {
  input.eventBus.subscribe<{
    userId: string;
    email: string;
    username: string;
  }>(AUTH_EVENT_NAMES.USER_REGISTERED, async (event) => {
    await input.sendAuthEmail({
      to: event.payload.email,
      template: AUTH_EMAIL_TEMPLATES.VERIFY_EMAIL,
      variables: {
        userId: event.payload.userId,
        username: event.payload.username,
      },
    });
  });

  input.eventBus.subscribe<{
    userId: string;
    email: string;
    resetToken: string;
  }>(AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED, async (event) => {
    await input.sendAuthEmail({
      to: event.payload.email,
      template: AUTH_EMAIL_TEMPLATES.PASSWORD_RESET,
      variables: {
        userId: event.payload.userId,
        resetToken: event.payload.resetToken,
      },
    });
  });
}
