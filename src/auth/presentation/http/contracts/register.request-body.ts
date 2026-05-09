import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimLowercaseString, trimString } from './string-transformers';

export class RegisterRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  username!: string;

  @Transform(trimLowercaseString)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
