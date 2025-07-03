// cifra.module.ts
import { Module } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { CifraController } from './cifra.controller';
import { JwtService } from '@nestjs/jwt';
import { SongService } from 'src/song/song.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CifraController],
  providers: [CifraService, JwtService, SongService, PrismaService],
})
export class CifraModule {}
