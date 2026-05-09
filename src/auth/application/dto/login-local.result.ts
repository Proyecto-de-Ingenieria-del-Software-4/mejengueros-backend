import type { IssueTokensResult } from '../../domain/services/issue-tokens.result';
import type { AuthRole } from './auth-role.type';

export type LoginLocalResult = {
  tokens: IssueTokensResult;
  user: { id: string; roles: AuthRole[] };
};
