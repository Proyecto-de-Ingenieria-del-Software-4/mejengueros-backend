import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE_KEY = 'auth:is-public';
export const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);
