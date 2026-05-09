import { ForbiddenAuthActionError } from '../../domain/exceptions/auth-domain.exceptions';
import type { UpdateUserRoleDependencies } from '../contracts';
import type { UpdateUserRoleCommand } from '../dto';

export class UpdateUserRoleUseCase {
  constructor(private readonly deps: UpdateUserRoleDependencies) {}

  async execute(command: UpdateUserRoleCommand): Promise<void> {
    const actor = await this.deps.userRepository.findById(command.actorUserId);
    if (!actor || !actor.roles.includes('ADMIN')) {
      throw new ForbiddenAuthActionError();
    }

    await this.deps.userRepository.updateRole(
      command.targetUserId,
      command.role,
    );
  }
}
