import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './string-transformers';

export class VerifyEmailRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  token!: string;
}
