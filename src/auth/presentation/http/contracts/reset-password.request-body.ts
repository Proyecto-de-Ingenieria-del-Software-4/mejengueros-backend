import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { trimString } from './string-transformers';

export class ResetPasswordRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  token!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
