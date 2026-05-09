import type {
  ConsumePasswordResetTokenCommand,
  IssuePasswordResetTokenCommand,
  PasswordResetTokenRecord,
} from './repositories/password-reset-token.contracts';
import type {
  ConsumeVerificationTokenCommand,
  IssueVerificationTokenCommand,
  VerificationTokenRecord,
} from './repositories/verification-token.contracts';
import type { IssueTokensResult } from './services/issue-tokens.result';
import { PASSWORD_RESET_TOKEN_CONTRACTS_FILE } from './repositories/password-reset-token.contracts';
import { VERIFICATION_TOKEN_CONTRACTS_FILE } from './repositories/verification-token.contracts';
import { ISSUE_TOKENS_RESULT_FILE } from './services/issue-tokens.result';

describe('auth domain contracts file split', () => {
  it('keeps password reset contracts typed from dedicated file', () => {
    const issue: IssuePasswordResetTokenCommand = {
      userId: 'u-1',
      tokenHash: 'h-1',
    };
    const consume: ConsumePasswordResetTokenCommand = { tokenHash: 'h-1' };
    const record: PasswordResetTokenRecord = { userId: 'u-1' };

    expect(issue.userId).toBe('u-1');
    expect(consume.tokenHash).toBe('h-1');
    expect(record.userId).toBe('u-1');
  });

  it('keeps verification contracts and token issue result in dedicated files', () => {
    const issue: IssueVerificationTokenCommand = {
      userId: 'u-2',
      tokenHash: 'h-2',
    };
    const consume: ConsumeVerificationTokenCommand = { tokenHash: 'h-2' };
    const record: VerificationTokenRecord = { userId: 'u-2' };
    const tokens: IssueTokensResult = {
      accessToken: 'a',
      refreshToken: 'r',
      refreshSessionId: 's',
      refreshFamilyId: 'f',
    };

    expect(issue.userId).toBe('u-2');
    expect(consume.tokenHash).toBe('h-2');
    expect(record.userId).toBe('u-2');
    expect(tokens.refreshFamilyId).toBe('f');
    expect(PASSWORD_RESET_TOKEN_CONTRACTS_FILE).toBe(true);
    expect(VERIFICATION_TOKEN_CONTRACTS_FILE).toBe(true);
    expect(ISSUE_TOKENS_RESULT_FILE).toBe(true);
  });
});
