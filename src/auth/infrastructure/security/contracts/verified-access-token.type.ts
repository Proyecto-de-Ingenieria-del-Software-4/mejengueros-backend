import type { AuthRole } from '../../../application/dto';

export type VerifiedAccessToken = {
  sub: string;
  roles: AuthRole[];
  sid: string;
};
