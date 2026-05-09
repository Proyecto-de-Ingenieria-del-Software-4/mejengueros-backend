import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { trimLowercaseString } from './string-transformers';

export class ResendVerificationRequestBody {
  @Transform(trimLowercaseString)
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
