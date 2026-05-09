import { Inject, Injectable } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import type {
  AuthEmailService,
  SendAuthEmailCommand,
} from './email.service.contract';
import { renderAuthEmailTemplate } from './templates/auth-email.templates';
import type { MailTransport } from './transport/mail-transport.contract';

@Injectable()
export class DefaultAuthEmailService implements AuthEmailService {
  constructor(
    @Inject(SHARED_TOKENS.MAIL_TRANSPORT)
    private readonly transport: MailTransport,
  ) {}

  async send(command: SendAuthEmailCommand): Promise<void> {
    const rendered = renderAuthEmailTemplate(
      command.template,
      command.variables,
    );

    await this.transport.send({
      to: command.to,
      subject: rendered.subject,
      text: rendered.text,
    });
  }
}
