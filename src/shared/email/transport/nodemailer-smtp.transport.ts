import { Inject, Injectable } from '@nestjs/common';
import { SHARED_TOKENS } from '../../tokens/shared-tokens';
import type { OutboundMail, MailTransport } from './mail-transport.contract';

type NodemailerLikeTransporter = {
  sendMail(mail: OutboundMail): Promise<unknown>;
};

@Injectable()
export class NodemailerSmtpTransport implements MailTransport {
  constructor(
    @Inject(SHARED_TOKENS.NODEMAILER_TRANSPORTER)
    private readonly transporter: NodemailerLikeTransporter,
  ) {}

  async send(mail: OutboundMail): Promise<void> {
    await this.transporter.sendMail(mail);
  }
}
