import 'jsonwebtoken';
import { Roles } from 'src/modules/users/entities/role.entity';

declare module 'jsonwebtoken' {
  interface JwtPayload {
    sub?: string;
    username: string;
    roles: Roles[];
  }
}