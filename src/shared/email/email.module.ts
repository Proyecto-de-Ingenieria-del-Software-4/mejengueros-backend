import { Global, Module } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import { DefaultAuthEmailService } from './auth-email.service';
import { NodemailerSmtpTransport } from './transport/nodemailer-smtp.transport';

@Global()
@Module({
  providers: [
    {
      provide: SHARED_TOKENS.NODEMAILER_TRANSPORTER,
      useValue: {
        sendMail: async () => Promise.resolve(),
      },
    },
    {
      provide: SHARED_TOKENS.MAIL_TRANSPORT,
      useClass: NodemailerSmtpTransport,
    },
    {
      provide: SHARED_TOKENS.AUTH_EMAIL_SERVICE,
      useClass: DefaultAuthEmailService,
    },
    NodemailerSmtpTransport,
    DefaultAuthEmailService,
  ],
  exports: [
    SHARED_TOKENS.MAIL_TRANSPORT,
    SHARED_TOKENS.AUTH_EMAIL_SERVICE,
    NodemailerSmtpTransport,
    DefaultAuthEmailService,
  ],
})
export class SharedEmailModule {}
