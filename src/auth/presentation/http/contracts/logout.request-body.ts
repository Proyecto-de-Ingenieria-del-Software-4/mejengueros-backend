import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './string-transformers';

export class LogoutRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
