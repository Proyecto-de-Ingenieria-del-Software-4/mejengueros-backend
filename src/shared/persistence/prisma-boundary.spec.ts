import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Prisma boundary', () => {
  it('uses shared persistence gateway from app module', () => {
    const appModule = readFileSync(
      join(process.cwd(), 'src', 'app.module.ts'),
      'utf8',
    );

    expect(appModule).toContain('SharedPersistenceModule');
    expect(appModule).not.toContain('PrismaClientModule');
    expect(appModule).not.toContain('PrismaClientService');
  });

  it('does not include removed todo module in app wiring', () => {
    const appModule = readFileSync(
      join(process.cwd(), 'src', 'app.module.ts'),
      'utf8',
    );

    expect(appModule).not.toContain('TodoModule');
    expect(appModule).not.toContain("from './todo/");
  });
});
