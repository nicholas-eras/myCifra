// src/app.module.ts
import { Module } from '@nestjs/common';
import { MusicModule } from './music/music.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MusicModule,
  ],
})
export class AppModule {}