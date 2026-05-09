import type { LogoutDependencies } from '../contracts';
import type { LogoutCommand } from '../dto';

export class LogoutUseCase {
  constructor(private readonly deps: LogoutDependencies) {}

  execute(command: LogoutCommand): Promise<void> {
    return this.deps.refreshSessionRepository.revokeSessionById(
      command.sessionId,
    );
  }
}
