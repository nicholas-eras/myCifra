
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

export type User = any;
export type FileEntity = any;
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService){}

  async findOne(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where:{
        email
      }
    });
  }

  async createFromGoogle(data: {
    email: string;
    googleId: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async getUsers(): Promise<User[] | undefined>{
    return this.prisma.user.findMany();
  }
}
