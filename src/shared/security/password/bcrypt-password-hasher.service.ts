import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import type { PasswordHasher } from './password-hasher.contract';

const DEFAULT_SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return hash(plainPassword, DEFAULT_SALT_ROUNDS);
  }

  verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return compare(plainPassword, passwordHash);
  }
}
