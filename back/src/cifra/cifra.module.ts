// cifra.module.ts
import { Module } from '@nestjs/common';
import { CifraService } from './cifra.service';
import { CifraController } from './cifra.controller';

@Module({
  controllers: [CifraController],
  providers: [CifraService],
})
export class CifraModule {}
