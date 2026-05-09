import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './string-transformers';

export class GoogleAuthRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
