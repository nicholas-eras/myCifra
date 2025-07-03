import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const trustedIp = process.env.TRUSTED_IP;
    if (!trustedIp) {
      throw new ForbiddenException('Configuração de IP não encontrada');
    }

    // 1. Tenta pegar do x-forwarded-for
    let clientIp =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      // 2. Se não tiver, pega do Express (considerando trust proxy)
      || request.ip
      // 3. Se ainda não tiver, pega do socket
      || request.socket.remoteAddress;

    // 4. Normaliza IPv6-mapped IPv4 (::ffff:1.2.3.4)
    clientIp = clientIp?.replace('::ffff:', '');

    console.log('Client IP:', clientIp);

    if (clientIp !== trustedIp) {
      throw new ForbiddenException('Acesso negado: IP não autorizado');
    }

    return true;
  }
}
