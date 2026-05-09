import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { PrismaClientService } from './prisma-client/prisma-client.service';

@Module({
  imports: [TodoModule, PrismaClientModule],
  controllers: [AppController],
  providers: [AppService, PrismaClientService],
})
export class AppModule {}
