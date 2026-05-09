export type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
};

export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

export interface PasswordPolicyValidator {
  validate(password: string, policy: PasswordPolicy): PasswordValidationResult;
}
