import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { SongService } from './song.service';
import { CreateSongDto, UpdateSongDto } from './dto/song.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express'; 

@Controller('song')
export class SongController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly songService: SongService
  ) {}

  @Post()
  create(@Body() createSongDto: CreateSongDto) {
    return this.songService.create(createSongDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const token = req.cookies?.token;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: Buffer.from(process.env.JWT_PUBLIC_KEY!, 'base64'),
          algorithms: ['RS256'],
        });
        userId = decoded.sub;
      } catch (err) {
        userId = null;
      }
    }

    return this.songService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const token = req.cookies?.token;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: Buffer.from(process.env.JWT_PUBLIC_KEY!, 'base64'),
          algorithms: ['RS256'],
        });
        userId = decoded.sub;
      } catch (err) {
        userId = null;
      }
    }
    return this.songService.findOne(+id, userId);
  }

  @Put(':id') 
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto) {
    return this.songService.update(+id, updateSongDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.songService.remove(+id);
  }

  @Put(':songId/chords')
  updateChords(@Param('songId', ParseIntPipe) id: number, @Body() updateSongChords: UpdateSongDto) {
    return this.songService.updateChords(id, updateSongChords);
  }
}