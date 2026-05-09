export interface RefreshSessionRepository {
  revokeSessionFamily(sessionFamilyId: string): Promise<void>;
  revokeSessionById(sessionId: string): Promise<void>;
}
