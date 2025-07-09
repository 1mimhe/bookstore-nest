import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthMessages } from '../enums/auth.messages';
import { HeaderNames } from '../enums/header.names';
import { AuthService } from 'src/modules/users/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException(AuthMessages.MissingAccessToken);
    }

    const payload = this.authService.verifyToken(accessToken, 'access');
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
