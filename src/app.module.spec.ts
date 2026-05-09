import 'reflect-metadata';
import { AppModule } from './app.module';

describe('AppModule architecture', () => {
  function getImportNames(): string[] {
    const imports = Reflect.getMetadata('imports', AppModule) as Array<{
      name?: string;
    }>;

    return (imports ?? []).map((importedModule) => importedModule.name ?? '');
  }

  it('does not import TodoModule starter slice', () => {
    const importNames = getImportNames();

    expect(importNames).not.toContain('TodoModule');
  });

  it('keeps AuthModule wired after starter cleanup', () => {
    const importNames = getImportNames();

    expect(importNames).toContain('AuthModule');
  });

  it('does not expose root starter controller', () => {
    const controllers = Reflect.getMetadata('controllers', AppModule) as
      | Array<{ name?: string }>
      | undefined;

    expect(
      (controllers ?? []).map((controller) => controller.name ?? ''),
    ).toEqual([]);
  });

  it('does not expose root starter service provider', () => {
    const providers = Reflect.getMetadata('providers', AppModule) as
      | Array<{ name?: string }>
      | undefined;

    expect((providers ?? []).map((provider) => provider.name ?? '')).toEqual(
      [],
    );
  });
});
