import 'express-session';
import { RolesEnum } from 'src/modules/users/entities/role.entity';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    staffId?: string;
    refreshToken: string;
    lastAccessed: Date;
    roles: RolesEnum[];
    destroy(callback?: (err: any) => void): void;
  }
}