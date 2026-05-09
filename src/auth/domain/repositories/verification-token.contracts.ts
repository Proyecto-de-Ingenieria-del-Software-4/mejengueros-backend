export type IssueVerificationTokenCommand = {
  userId: string;
  tokenHash: string;
  expiresAt?: Date;
};

export type ConsumeVerificationTokenCommand = {
  tokenHash: string;
  now?: Date;
};

export type VerificationTokenRecord = {
  userId: string;
};

export const VERIFICATION_TOKEN_CONTRACTS_FILE = true;
