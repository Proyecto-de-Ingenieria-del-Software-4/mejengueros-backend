import { AUTH_EVENT_NAMES } from './auth-events.constants';
import type { DomainEvent } from './domain-event.contract';

export type UserRegisteredPayload = {
  userId: string;
  email: string;
  username: string;
};

export type PasswordResetRequestedPayload = {
  userId: string;
  email: string;
  resetToken: string;
};

export class UserRegisteredEvent implements DomainEvent<UserRegisteredPayload> {
  readonly name = AUTH_EVENT_NAMES.USER_REGISTERED;

  constructor(
    public readonly payload: UserRegisteredPayload,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class PasswordResetRequestedEvent implements DomainEvent<PasswordResetRequestedPayload> {
  readonly name = AUTH_EVENT_NAMES.PASSWORD_RESET_REQUESTED;

  constructor(
    public readonly payload: PasswordResetRequestedPayload,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
