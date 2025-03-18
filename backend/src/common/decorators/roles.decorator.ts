import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../account/entities/account.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
