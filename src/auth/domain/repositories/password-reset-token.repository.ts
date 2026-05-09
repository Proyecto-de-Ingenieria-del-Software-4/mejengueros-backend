import type {
  ConsumePasswordResetTokenCommand,
  IssuePasswordResetTokenCommand,
  PasswordResetTokenRecord,
} from './password-reset-token.contracts';

export type {
  ConsumePasswordResetTokenCommand,
  IssuePasswordResetTokenCommand,
  PasswordResetTokenRecord,
} from './password-reset-token.contracts';

export interface PasswordResetTokenRepository {
  issue(command: IssuePasswordResetTokenCommand): Promise<void>;
  consumeValid(
    command: ConsumePasswordResetTokenCommand,
  ): Promise<PasswordResetTokenRecord | null>;
}
