export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
};

export interface MailTransport {
  send(mail: OutboundMail): Promise<void>;
}
