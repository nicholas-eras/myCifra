import { Module } from '@nestjs/common';
import { SongModule } from './song/song.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CifraModule } from './cifra/cifra.module';

@Module({
  imports: [
    PrismaModule,
    SongModule,
    AuthModule,
    CifraModule
  ],
})
export class AppModule {}