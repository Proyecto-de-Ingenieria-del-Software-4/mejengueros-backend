import type { AuthEmailTemplate } from './email.constants';

export type SendAuthEmailCommand = {
  to: string;
  template: AuthEmailTemplate;
  variables: Record<string, string>;
};

export interface AuthEmailService {
  send(command: SendAuthEmailCommand): Promise<void>;
}
