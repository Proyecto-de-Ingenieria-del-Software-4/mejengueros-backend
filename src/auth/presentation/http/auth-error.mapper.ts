import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AuthDomainError } from '../../domain/exceptions';

export const mapAuthErrorToHttpException = (error: unknown): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  if (error instanceof AuthDomainError) {
    return new HttpException(
      {
        code: error.code,
        status: error.httpStatus,
        message: error.message,
        ...(error.details?.length && { details: error.details }),
        ...(error.metadata && { metadata: error.metadata }),
      },
      error.httpStatus,
    );
  }

  return new InternalServerErrorException();
};
