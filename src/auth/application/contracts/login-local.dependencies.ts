import type { IssueTokensResult } from '../../domain/services/issue-tokens.result';
import type { LoginLocalUser } from '../dto/login-local-user.type';

export type LoginLocalDependencies = {
  userRepository: {
    findByUsername(username: string): Promise<LoginLocalUser | null>;
    save(user: LoginLocalUser): Promise<void>;
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
