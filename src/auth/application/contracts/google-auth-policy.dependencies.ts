import type { UserRepository } from '../../domain/repositories/user.repository';

export type GoogleAuthPolicyDependencies = {
  userRepository: Pick<UserRepository, 'findByEmail'>;
};
