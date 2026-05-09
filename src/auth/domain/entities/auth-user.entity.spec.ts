import { AuthUser } from './auth-user.entity';

describe('AuthUser', () => {
  it('locks account after threshold failed attempts and unlocks after lock duration', () => {
    const user = AuthUser.create({
      id: 'user-1',
      username: 'tester',
      email: 'tester@example.com',
      emailVerified: false,
      role: 'USER',
      tokenVersion: 0,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    const now = new Date('2026-01-01T10:00:00.000Z');

    user.recordFailedLoginAttempt({
      threshold: 3,
      lockDurationMs: 5 * 60 * 1000,
      now,
    });
    user.recordFailedLoginAttempt({
      threshold: 3,
      lockDurationMs: 5 * 60 * 1000,
      now,
    });

    expect(user.canAttemptLogin(new Date('2026-01-01T10:01:00.000Z'))).toBe(
      true,
    );

    user.recordFailedLoginAttempt({
      threshold: 3,
      lockDurationMs: 5 * 60 * 1000,
      now,
    });

    expect(user.canAttemptLogin(new Date('2026-01-01T10:01:00.000Z'))).toBe(
      false,
    );
    expect(user.failedLoginAttempts).toBe(3);

    expect(user.canAttemptLogin(new Date('2026-01-01T10:06:01.000Z'))).toBe(
      true,
    );
  });

  it('increments token version and clears security counters when marking authenticated', () => {
    const user = AuthUser.create({
      id: 'user-2',
      username: 'tester2',
      email: 'tester2@example.com',
      emailVerified: true,
      role: 'USER',
      tokenVersion: 4,
      failedLoginAttempts: 2,
      lockUntil: new Date('2026-01-01T10:20:00.000Z'),
    });

    user.bumpTokenVersion();
    user.markAuthenticated();

    expect(user.tokenVersion).toBe(5);
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockUntil).toBeNull();
  });

  it('exposes immutable identity and profile getters used by use cases', () => {
    const user = AuthUser.create({
      id: 'user-3',
      username: 'tester3',
      email: 'tester3@example.com',
      emailVerified: true,
      role: 'ADMIN',
      tokenVersion: 1,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    expect(user.id).toBe('user-3');
    expect(user.username).toBe('tester3');
    expect(user.email).toBe('tester3@example.com');
    expect(user.emailVerified).toBe(true);
    expect(user.role).toBe('ADMIN');
  });
});
