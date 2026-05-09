import type { UserRepository } from '../../domain/repositories/user.repository';

export type GetCurrentProfileDependencies = {
  userRepository: Pick<UserRepository, 'findById'>;
};
