import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { HeaderNames } from 'src/common/enums/header.names';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class SoftAuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractBearerToken(request);

    if (!accessToken) {
      request.user = {};
      return true;
    }

    try {
      const payload = this.tokenService.verifyToken(accessToken, 'access');
      
      // If token is invalid or missing username, allow access but don't set user
      if (!payload?.username) {
        request.user = {};
        return true;
      }

      request.user = {
        id: payload.sub!
      };
      
      return true;
    } catch (error) {
      request.user = {};
      return true;
    }
  }

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers[HeaderNames.Auth] as string;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}