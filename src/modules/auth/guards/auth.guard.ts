import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthMessages } from 'src/common/enums/auth.messages';
import { HeaderNames } from 'src/common/enums/header.names';

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
