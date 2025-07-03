import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { IpWhitelistGuard } from '../auth/auth.ip-whitelist.guard';
import { AuthGuard } from '@nestjs/passport';
import { SongService } from '../song/song.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

export class GetCifraDto {
  url: string;
}

@UseGuards(IpWhitelistGuard)
@Controller('cifra')
export class CifraController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly songService: SongService, 
    private readonly cifraService: CifraService
  ) {}

  @Post()
  async getCifra(@Body() body: GetCifraDto) {
    return this.cifraService.redirectScrapeCifra(body.url);
  }

  @Post('verify')
  verifyUrl(@Body() body: GetCifraDto) {
    const parsed = this.cifraService.extractArtistSong(body.url);

    if (!parsed) {
      return { error: 'URL inválida' };
    }

    return { ok: true, parsed };
  }

  @Post('save')
  @UseGuards(AuthGuard('jwt')) 
  async saveCifra(@Body() data: any, @Req() req: Request): Promise<any> {
    const { name, artist, cifra } = data;
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

    if (!name || !artist || !cifra || !Array.isArray(cifra)) {
      throw new BadRequestException("JSON inválido");
    }

    const lyrics = this.cifraService.processCifra(cifra);

    if (!userId) {
      throw new BadRequestException("Usuário não identificado no token");
    }

    const newSong = await this.songService.create({
      name,
      artist,
      lyrics,
      createdBy:userId,
    });

    return {
      ok: true,
      saved: newSong,
    };
  }


}
