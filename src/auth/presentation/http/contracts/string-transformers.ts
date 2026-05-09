import type { TransformFnParams } from 'class-transformer';

const normalizeString = (value: unknown, toLowercase: boolean): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return toLowercase ? trimmed.toLowerCase() : trimmed;
};

export const trimString = ({ value }: TransformFnParams): unknown =>
  normalizeString(value as unknown, false);

export const trimLowercaseString = ({ value }: TransformFnParams): unknown =>
  normalizeString(value as unknown, true);
