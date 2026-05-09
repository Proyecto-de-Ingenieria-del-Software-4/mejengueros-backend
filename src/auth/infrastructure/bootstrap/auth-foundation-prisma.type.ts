export type AuthFoundationPrisma = {
  role: {
    upsert(args: unknown): Promise<unknown>;
  };
  authProvider: {
    upsert(args: unknown): Promise<unknown>;
  };
  appKey: {
    upsert(args: unknown): Promise<unknown>;
  };
  passwordPolicy: {
    findFirst(args?: unknown): Promise<unknown>;
    create(args: unknown): Promise<unknown>;
  };
};
