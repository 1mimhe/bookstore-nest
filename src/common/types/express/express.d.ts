import { Express } from 'express';
import { User } from 'src/modules/users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
      user?: Partial<User>;
    }
  }
}
