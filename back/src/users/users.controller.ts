import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Listar todos os usuários
   * Somente admin pode acessar
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async listUsers(@CurrentUser() user) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Apenas administradores podem ver os usuários.');
    }
    return this.usersService.getUsers();
  }

  /**
   * Atualizar permissões de um usuário
   * Somente admin pode alterar
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePermissions(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      isAdmin: boolean;
      canAddSong: boolean;
      canSyncCifra: boolean;
    }>,
    @CurrentUser() user
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Apenas administradores podem alterar permissões.');
    }
    return this.usersService.updatePermissions(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getCurrentUser(@CurrentUser() user) {
    return user;
  }
}
