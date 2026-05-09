import { AUTH_EMAIL_TEMPLATES } from './email.constants';
import { DefaultAuthEmailService } from './auth-email.service';
import type { MailTransport } from './transport/mail-transport.contract';

class MailTransportSpy implements MailTransport {
  sent: Array<{ to: string; subject: string; text: string }> = [];

  async send(mail: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    this.sent.push(mail);
  }
}

describe('DefaultAuthEmailService', () => {
  it('renders verify email template and dispatches through transport', async () => {
    const transport = new MailTransportSpy();
    const service = new DefaultAuthEmailService(transport);

    await service.send({
      to: 'user@example.com',
      template: AUTH_EMAIL_TEMPLATES.VERIFY_EMAIL,
      variables: {
        username: 'tester',
        verificationToken: 'token-123',
      },
    });

    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]?.to).toBe('user@example.com');
    expect(transport.sent[0]?.subject).toBe('Verify your email');
    expect(transport.sent[0]?.text).toContain('token-123');
  });

  it('renders password reset template for reset notifications', async () => {
    const transport = new MailTransportSpy();
    const service = new DefaultAuthEmailService(transport);

    await service.send({
      to: 'user@example.com',
      template: AUTH_EMAIL_TEMPLATES.PASSWORD_RESET,
      variables: {
        resetToken: 'reset-123',
      },
    });

    expect(transport.sent[0]?.subject).toBe('Reset your password');
    expect(transport.sent[0]?.text).toContain('reset-123');
  });
});
