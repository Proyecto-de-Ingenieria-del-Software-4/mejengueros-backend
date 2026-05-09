import {
  AuthInfrastructureError,
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from '../../../domain/exceptions';
import type { PrismaErrorLike } from './prisma-error-like.type';

const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';

const toTargetList = (target?: string | string[]): string[] => {
  if (Array.isArray(target)) {
    return target;
  }

  if (typeof target === 'string') {
    return [target];
  }

  return [];
};

export const mapPrismaAuthError = (error: unknown): Error => {
  const prismaError = error as PrismaErrorLike;

  if (prismaError?.code === PRISMA_UNIQUE_CONSTRAINT_CODE) {
    const target = toTargetList(prismaError.meta?.target);

    if (target.includes('email')) {
      return new EmailAlreadyExistsError();
    }

    if (target.includes('username')) {
      return new UsernameAlreadyExistsError();
    }
  }

  return new AuthInfrastructureError();
};
