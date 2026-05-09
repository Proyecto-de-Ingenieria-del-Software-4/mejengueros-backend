export type DomainEvent<TPayload> = {
  name: string;
  occurredAt: Date;
  payload: TPayload;
};
