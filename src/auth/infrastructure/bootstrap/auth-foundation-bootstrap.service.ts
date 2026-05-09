import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../shared/persistence/prisma.service';
import { ensureAuthFoundation } from './ensure-auth-foundation';

@Injectable()
export class AuthFoundationBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthFoundationBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await ensureAuthFoundation(this.prisma);
    this.logger.log('Auth foundation baseline is ready');
  }
}
