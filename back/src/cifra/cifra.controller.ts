import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { IpWhitelistGuard } from 'src/auth/auth.ip-whitelist.guard';

export class GetCifraDto {
  url: string;
}

@UseGuards(IpWhitelistGuard)
@Controller('cifra')
export class CifraController {
  constructor(private readonly cifraService: CifraService) {}

  @Post()
  async getCifra(@Body() body: GetCifraDto) {
    return this.cifraService.scrapeCifra(body.url);
  }
}
