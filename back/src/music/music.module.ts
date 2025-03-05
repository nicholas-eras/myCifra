// src/music/music.module.ts
import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MusicService],
  controllers: [MusicController],
})
export class MusicModule {}