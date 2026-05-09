import { PasswordPolicyValidatorService } from './password-policy-validator.service';

describe('PasswordPolicyValidatorService', () => {
  const service = new PasswordPolicyValidatorService();

  it('accepts password that satisfies policy', () => {
    const result = service.validate('StrongPass123!', {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: true,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns all violated constraints', () => {
    const result = service.validate('weak', {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'PASSWORD_TOO_SHORT',
        'PASSWORD_UPPERCASE_REQUIRED',
        'PASSWORD_NUMBER_REQUIRED',
        'PASSWORD_SYMBOL_REQUIRED',
      ]),
    );
  });
});
