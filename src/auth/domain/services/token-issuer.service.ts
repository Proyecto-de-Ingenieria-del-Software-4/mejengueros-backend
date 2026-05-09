import type { IssueTokensResult } from './issue-tokens.result';

export type { IssueTokensResult } from './issue-tokens.result';

export interface TokenIssuer {
  issueForUser(
    userId: string,
    tokenVersion: number,
  ): Promise<IssueTokensResult>;
  rotateRefreshToken(refreshToken: string): Promise<IssueTokensResult>;
}
