export interface ResendVerificationThrottleStore {
  isOnCooldown(
    identity: string,
    now: Date,
    cooldownMs: number,
  ): Promise<boolean>;
  mark(identity: string, at: Date): Promise<void>;
}
