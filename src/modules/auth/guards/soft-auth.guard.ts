import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SoftAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = request.user ?? {};

    const userId = request.session?.userId;
    if (userId) {
      request.user.id = userId;
    }

    return true;
  }
}