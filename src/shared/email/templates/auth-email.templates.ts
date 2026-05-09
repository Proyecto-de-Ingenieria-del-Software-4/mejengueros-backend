import {
  AUTH_EMAIL_TEMPLATES,
  type AuthEmailTemplate,
} from '../email.constants';

export type RenderedAuthEmail = {
  subject: string;
  text: string;
};

export function renderAuthEmailTemplate(
  template: AuthEmailTemplate,
  variables: Record<string, string>,
): RenderedAuthEmail {
  if (template === AUTH_EMAIL_TEMPLATES.VERIFY_EMAIL) {
    return {
      subject: 'Verify your email',
      text: `Hi ${variables.username ?? 'there'}, verify your account using token: ${variables.verificationToken ?? ''}`,
    };
  }

  return {
    subject: 'Reset your password',
    text: `Use this token to reset your password: ${variables.resetToken ?? ''}`,
  };
}
