import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
      user?: User;
    }
  }
}
