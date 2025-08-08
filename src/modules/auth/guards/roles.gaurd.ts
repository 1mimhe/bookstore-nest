import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthMessages } from 'src/common/enums/error.messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userRoles = request.session.roles;

    if (!userRoles) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    const hasPermission = userRoles.some(role => requiredRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    return true;
  }
}
