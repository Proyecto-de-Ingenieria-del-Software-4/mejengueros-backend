import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Auth module structure baseline', () => {
  const authRoot = __dirname;
  const appModulePath = join(
    authRoot,
    'application',
    'auth-application.module.ts',
  );
  const infraModulePath = join(
    authRoot,
    'infrastructure',
    'auth-infrastructure.module.ts',
  );
  const authModulePath = join(authRoot, 'auth.module.ts');

  it('splits auth wiring into application + infrastructure modules', () => {
    expect(existsSync(appModulePath)).toBe(true);
    expect(existsSync(infraModulePath)).toBe(true);

    const authModuleSource = readFileSync(authModulePath, 'utf8');
    expect(authModuleSource).toContain('./application/auth-application.module');
    expect(authModuleSource).toContain(
      './infrastructure/auth-infrastructure.module',
    );
  });

  it('uses only AUTH_TOKENS in auth wiring', () => {
    const authModuleSource = readFileSync(authModulePath, 'utf8');
    expect(authModuleSource).not.toContain('AUTH_APPLICATION_TOKENS');
  });
});
