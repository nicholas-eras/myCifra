import { Body, ConflictException, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}

  // @Post()
  // async createUser(@Body() body: { email: string; password: string }) {
  //   const user = await this.userService.findOne(body.email);
  //   if (user) {
  //     throw new ConflictException('User already created.');
  //   }
  //   return this.userService.createUser(body.email, body.password);
  // }
}
