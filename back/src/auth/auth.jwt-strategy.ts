import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.token
      ]),
      secretOrKey: Buffer.from(process.env.JWT_PUBLIC_KEY!, 'base64'),
      algorithms: ['RS256'],
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      canAddSong: payload.canAddSong,
      canSyncCifra: payload.canSyncCifra,
    };
  }
}
