import type { UserRepository } from '../../domain/repositories/user.repository';

export type UpdateUserRoleDependencies = {
  userRepository: Pick<UserRepository, 'findById' | 'updateRole'>;
};
