import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from "src/modules/users/users.service";
import { AuthMessages } from '../enums/error.messages';


@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user ?? {};
    
    if (id) {
      const user = await this.usersService.findOne(id);
      if (!user) throw new UnauthorizedException(AuthMessages.Unauthorized);
      req.user = user ? user : undefined;
    }

    next();
  }
}