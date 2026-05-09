export interface CredentialsRepository {
  findPasswordHashByUserId(userId: string): Promise<string | null>;
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
}
