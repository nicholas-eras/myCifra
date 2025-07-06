import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { SongController } from './song.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [PrismaModule],
  providers: [SongService, JwtService, UsersService],
  controllers: [SongController],
})
export class SongModule {}