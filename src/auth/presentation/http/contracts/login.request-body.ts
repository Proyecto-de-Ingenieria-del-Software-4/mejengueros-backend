import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { trimString } from './string-transformers';

export class LoginRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
