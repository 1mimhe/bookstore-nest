import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (key: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as Request;
    if (key) {
      if (key === 'id') {
        return request.user?.id ?? request.session?.userId;
      }
      return request.user?.[key] ?? request.session?.[key];
    }
    return request.user ?? { id: request.session?.userId, roles: request.session?.roles, staffId: request.session?.staffId };
  },
);