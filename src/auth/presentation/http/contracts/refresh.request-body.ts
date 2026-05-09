import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './string-transformers';

export class RefreshRequestBody {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
