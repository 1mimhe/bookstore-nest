import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from "src/modules/users/users.service";


@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session;

    if (userId) {
      const user = await this.usersService.findOne(userId);
      req.user = user;
    }

    next();
  }
}