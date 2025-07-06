// cifra.module.ts
import { Module } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { CifraController } from './cifra.controller';
import { JwtService } from '@nestjs/jwt';
import { SongService } from '../song/song.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [CifraController],
  providers: [CifraService, JwtService, SongService, PrismaService, UsersService],
})
export class CifraModule {}
