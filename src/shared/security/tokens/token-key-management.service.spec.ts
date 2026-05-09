import { TokenKeyManagementService } from './token-key-management.service';

describe('TokenKeyManagementService', () => {
  const service = new TokenKeyManagementService();

  it('generates opaque random token and deterministic fingerprint', () => {
    const token = service.generateOpaqueToken();
    const fingerprintA = service.fingerprint(token);
    const fingerprintB = service.fingerprint(token);

    expect(token.length).toBeGreaterThanOrEqual(64);
    expect(fingerprintA).toBe(fingerprintB);
    expect(fingerprintA).not.toContain(token);
  });

  it('generates different tokens across invocations', () => {
    const tokenA = service.generateOpaqueToken();
    const tokenB = service.generateOpaqueToken();

    expect(tokenA).not.toBe(tokenB);
  });
});
