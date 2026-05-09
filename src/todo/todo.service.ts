import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaClientService } from 'src/prisma-client/prisma-client.service';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaClientService) {}

  create(createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        completed: createTodoDto.completed,
      },
    });
  }

  findAll() {
    return this.prisma.todo.findMany();
  }

  findOne(id: number) {
    return this.prisma.todo.findUnique({
      where: { id: id.toString() },
    });
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return this.prisma.todo.update({
      where: { id: id.toString() },
      data: {
        title: updateTodoDto.title,
        completed: updateTodoDto.completed,
      },
    });
  }

  remove(id: number) {
    return this.prisma.todo.delete({
      where: { id: id.toString() },
    });
  }
}
