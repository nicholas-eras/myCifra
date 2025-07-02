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

    const clientIp = (request.headers['x-forwarded-for'] as string) || request.socket.remoteAddress;

    if (!clientIp || !trustedIp) {
      throw new ForbiddenException('Configuração de IP não encontrada');
    }

    if (!clientIp.includes(trustedIp)) {
      throw new ForbiddenException('Acesso negado: IP não autorizado');
    }

    return true;
  }
}
