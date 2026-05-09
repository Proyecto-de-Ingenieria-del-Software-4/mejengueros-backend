import type { RefreshSessionRepository } from '../../domain/repositories/refresh-session.repository';

export type LogoutDependencies = {
  refreshSessionRepository: Pick<RefreshSessionRepository, 'revokeSessionById'>;
};
