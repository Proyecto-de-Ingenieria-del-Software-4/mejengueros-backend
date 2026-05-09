export type IssuePasswordResetTokenCommand = {
  userId: string;
  tokenHash: string;
  expiresAt?: Date;
};

export type ConsumePasswordResetTokenCommand = {
  tokenHash: string;
  now?: Date;
};

export type PasswordResetTokenRecord = {
  userId: string;
};

export const PASSWORD_RESET_TOKEN_CONTRACTS_FILE = true;
