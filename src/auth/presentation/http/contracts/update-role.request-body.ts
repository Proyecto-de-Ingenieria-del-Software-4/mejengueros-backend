import { IsIn } from 'class-validator';

const ALLOWED_AUTH_ROLES = ['USER', 'ADMIN'] as const;

export class UpdateRoleRequestBody {
  @IsIn(ALLOWED_AUTH_ROLES)
  role!: (typeof ALLOWED_AUTH_ROLES)[number];
}
