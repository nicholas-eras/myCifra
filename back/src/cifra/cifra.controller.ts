import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { IpWhitelistGuard } from '../auth/auth.ip-whitelist.guard';

export class GetCifraDto {
  url: string;
}

@UseGuards(IpWhitelistGuard)
@Controller('cifra')
export class CifraController {
  constructor(private readonly cifraService: CifraService) {}

  @Post()
  async getCifra(@Body() body: GetCifraDto) {
    return this.cifraService.redirectScrapeCifra(body.url);
  }
}
