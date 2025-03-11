import { UserRole } from '../entities/account.entity';

export class AccountDto {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  active: boolean;
  role: UserRole;
  companyName?: string;
  lastLogin?: Date;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
