import { Global, Module } from '@nestjs/common';
import { SHARED_TOKENS } from '../tokens/shared-tokens';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: SHARED_TOKENS.PRISMA_SERVICE,
      useExisting: PrismaService,
    },
  ],
  exports: [PrismaService, SHARED_TOKENS.PRISMA_SERVICE],
})
export class SharedPersistenceModule {}
