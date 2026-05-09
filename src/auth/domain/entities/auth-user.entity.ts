import type { AuthRole } from '../auth.constants';

type CreateAuthUserProps = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  role: AuthRole;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockUntil: Date | null;
};

type FailedLoginPolicy = {
  threshold: number;
  lockDurationMs: number;
  now: Date;
};

export class AuthUser {
  private constructor(private readonly props: CreateAuthUserProps) {}

  static create(props: CreateAuthUserProps): AuthUser {
    return new AuthUser(props);
  }

  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get role(): AuthRole {
    return this.props.role;
  }

  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts;
  }

  get lockUntil(): Date | null {
    return this.props.lockUntil;
  }

  get tokenVersion(): number {
    return this.props.tokenVersion;
  }

  canAttemptLogin(now: Date): boolean {
    if (!this.props.lockUntil) {
      return true;
    }

    return now.getTime() > this.props.lockUntil.getTime();
  }

  recordFailedLoginAttempt(policy: FailedLoginPolicy): void {
    this.props.failedLoginAttempts += 1;

    if (this.props.failedLoginAttempts >= policy.threshold) {
      this.props.lockUntil = new Date(
        policy.now.getTime() + policy.lockDurationMs,
      );
    }
  }

  markAuthenticated(): void {
    this.props.failedLoginAttempts = 0;
    this.props.lockUntil = null;
  }

  bumpTokenVersion(): void {
    this.props.tokenVersion += 1;
  }

  markEmailVerified(): void {
    this.props.emailVerified = true;
  }
}
