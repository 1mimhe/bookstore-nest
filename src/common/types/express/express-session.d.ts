import 'express-session';
import { Roles } from 'src/modules/users/entities/role.entity';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refreshToken: string;
    lastAccessed: Date;
    roles: Roles[];
    destroy(callback?: (err: any) => void): void;
  }
}