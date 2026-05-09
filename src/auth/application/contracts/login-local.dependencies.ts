import type { IssueTokensResult } from '../../domain/services/issue-tokens.result';
import type { AuthUserProfile } from '../../domain/types/auth-user-profile.type';

export type LoginLocalDependencies = {
  userRepository: {
    findByUsername(username: string): Promise<AuthUserProfile | null>;
    save(user: AuthUserProfile): Promise<void>;
  };
  credentialsRepository: {
    findPasswordHashByUserId(userId: string): Promise<string | null>;
  };
  tokenIssuer: {
    issueForUser(
      userId: string,
      tokenVersion: number,
    ): Promise<IssueTokensResult>;
  };
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  now(): Date;
  lockoutThreshold: number;
  lockoutDurationMs: number;
};
