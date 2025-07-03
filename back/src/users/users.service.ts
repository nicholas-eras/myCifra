
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePermissions(userId: string, permissions: Partial<Pick<User, 'isAdmin' | 'canAddSong' | 'canSyncCifra'>>): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: permissions,
    });
  }
}
