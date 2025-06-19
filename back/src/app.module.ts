import { Module } from '@nestjs/common';
import { SongModule } from './song/song.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    SongModule,
    AuthModule
  ],
})
export class AppModule {}