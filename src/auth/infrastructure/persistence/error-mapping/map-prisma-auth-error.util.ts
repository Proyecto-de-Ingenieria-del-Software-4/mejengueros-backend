import {
  AuthBaselineNotReadyError,
  AuthInfrastructureError,
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from '../../../domain/exceptions';
import type { PrismaAuthErrorContext } from './prisma-auth-error-context.type';
import type { PrismaErrorLike } from './prisma-error-like.type';

const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';
const PRISMA_RECORD_NOT_FOUND_CODE = 'P2025';
const PRISMA_REQUIRED_RECORD_MISSING_CODE = 'P2018';

const toTargetList = (target?: string | string[]): string[] => {
  if (Array.isArray(target)) {
    return target;
  }

  if (typeof target === 'string') {
    return [target];
  }

  return [];
};

const toErrorMessage = (error: PrismaErrorLike): string => {
  if (typeof error.message !== 'string') {
    return '';
  }

  return error.message.toLowerCase();
};

const toSafeMetadata = (
  error: PrismaErrorLike,
  context: PrismaAuthErrorContext,
): Record<string, unknown> => ({
  source: 'prisma',
  repository: context.repository,
  operation: context.operation,
  ...(typeof error.code === 'string' ? { prismaCode: error.code } : {}),
});

export const mapPrismaAuthError = (
  error: unknown,
  context: PrismaAuthErrorContext,
): Error => {
  const prismaError = error as PrismaErrorLike;
  const errorMessage = toErrorMessage(prismaError);

  if (prismaError?.code === PRISMA_UNIQUE_CONSTRAINT_CODE) {
    const target = toTargetList(prismaError.meta?.target);

    if (target.includes('email')) {
      return new EmailAlreadyExistsError();
    }

    if (target.includes('username')) {
      return new UsernameAlreadyExistsError();
    }
  }

  if (
    prismaError?.code === PRISMA_RECORD_NOT_FOUND_CODE ||
    prismaError?.code === PRISMA_REQUIRED_RECORD_MISSING_CODE
  ) {
    if (
      errorMessage.includes('role') ||
      errorMessage.includes('authprovider') ||
      errorMessage.includes('auth provider')
    ) {
      return new AuthBaselineNotReadyError({
        metadata: toSafeMetadata(prismaError, context),
        cause: error,
      });
    }
  }

  return new AuthInfrastructureError({
    metadata: toSafeMetadata(prismaError, context),
    cause: error,
  });
};
