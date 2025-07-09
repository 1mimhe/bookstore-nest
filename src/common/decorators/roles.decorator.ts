import { SetMetadata } from '@nestjs/common';

export const RequiredRoles = (...roles: string[]) => SetMetadata('roles', roles);