import type { AuthRole } from '../auth.constants';
import type { AuthUser } from '../entities/auth-user.entity';

export interface UserRepository {
  findById(id: string): Promise<AuthUser | null>;
  findByUsername(username: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  save(user: AuthUser): Promise<void>;
  updateRole(userId: string, role: AuthRole): Promise<void>;
  bumpTokenVersion(userId: string): Promise<void>;
}
