import { UserNotFoundError } from '../../domain/exceptions/auth-domain.exceptions';
import type { GetCurrentProfileDependencies } from '../contracts';
import type { GetCurrentProfileCommand, GetCurrentProfileResult } from '../dto';

export class GetCurrentProfileUseCase {
  constructor(private readonly deps: GetCurrentProfileDependencies) {}

  async execute(
    command: GetCurrentProfileCommand,
  ): Promise<GetCurrentProfileResult> {
    const user = await this.deps.userRepository.findById(command.userId);
    if (!user) throw new UserNotFoundError();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      emailVerified: user.emailVerified,
    };
  }
}
