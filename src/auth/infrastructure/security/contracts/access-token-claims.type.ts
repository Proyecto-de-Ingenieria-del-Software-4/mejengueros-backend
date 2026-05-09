import type { AuthRole } from '../../../application/dto';

export type AccessTokenClaims = {
  sub: string;
  roles: AuthRole[];
  sid: string;
  typ: 'access';
  exp: number;
};
