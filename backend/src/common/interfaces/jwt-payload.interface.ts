import { UserRole } from '../../account/entities/account.entity';

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  tenantCode?: string; // Optional for admin users
  iat?: number;
  exp?: number;
}
