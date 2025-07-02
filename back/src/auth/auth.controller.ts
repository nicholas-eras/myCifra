import { Controller, Req, Get, BadRequestException, Res } from '@nestjs/common';
import { GoogleAuthService } from './google.auth.service';
import { AuthService } from './auth.service';
import { Request, Response } from 'express'; 

@Controller('api/auth')
export class AuthController {
constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService
  ) {}

    @Get('google')
    getGoogleAuthUrl(): { url: string } {
        const url = this.googleAuthService.generateAuthUrl();
        return { url };
    }
  
    @Get('google/callback')
    async handleGoogleCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const code = req.query.code as string;

        if (!code) {
            throw new BadRequestException('Authorization code not provided');
        }

        const userData = await this.googleAuthService.getUserFromCode(code);
        const token = await this.authService.googleLogin(userData);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24, // 1 dia
        });
 
        return {
            redirect : process.env.FRONTEND_URL ?? 'http://localhost:3001'
        };
    } 
}