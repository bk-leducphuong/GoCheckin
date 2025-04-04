import { UserRole } from '../../account/entities/account.entity';

export interface JwtPayload {
  userId: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}
