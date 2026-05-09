import type {
  ConsumeVerificationTokenCommand,
  IssueVerificationTokenCommand,
  VerificationTokenRecord,
} from './verification-token.contracts';

export type {
  ConsumeVerificationTokenCommand,
  IssueVerificationTokenCommand,
  VerificationTokenRecord,
} from './verification-token.contracts';

export interface VerificationTokenRepository {
  issue(command: IssueVerificationTokenCommand): Promise<void>;
  consumeValid(
    command: ConsumeVerificationTokenCommand,
  ): Promise<VerificationTokenRecord | null>;
}
