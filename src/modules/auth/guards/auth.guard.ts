import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthMessages } from 'src/common/enums/error.messages';
import { HeaderNames } from 'src/common/enums/header.names';
import { TokenService } from '../../modules/auth/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException(AuthMessages.MissingAccessToken);
    }

    const payload = this.tokenService.verifyToken(accessToken, 'access');
    if (!payload?.username) {
      throw new UnauthorizedException(AuthMessages.InvalidAccessToken);
    }

    if (request.session.userId !== payload.sub) {
      throw new UnauthorizedException(AuthMessages.InvalidAccessToken);
    }

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers[HeaderNames.Auth] as string;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
