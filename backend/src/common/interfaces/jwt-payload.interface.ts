import { UserRole } from '../../account/entities/account.entity';

export interface JwtPayload {
  userId: string;
  username?: string;
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}
