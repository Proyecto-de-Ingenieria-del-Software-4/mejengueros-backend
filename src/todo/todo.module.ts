import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { PrismaClientModule } from 'src/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
