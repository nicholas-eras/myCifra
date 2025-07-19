import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}  

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const existingUser = await this.usersService.findOne(user.email);
    const userToUse = existingUser || await this.usersService.createFromGoogle(user);
  
    const payload = {
      sub: userToUse.id,
      email: userToUse.email,
      isAdmin: userToUse.isAdmin,
      canAddSong: userToUse.canAddSong,
      canSyncCifra: userToUse.canSyncCifra
    };
  
    return await this.jwtService.signAsync(payload, {
        secret: Buffer.from(process.env.JWT_PRIVATE_KEY!, 'base64'),
        algorithm: 'RS256',
        expiresIn: '7d',
      })
  } 
}