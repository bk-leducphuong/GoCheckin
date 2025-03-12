import { UserRole } from '../entities/account.entity';

export class CreateAccountDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  companyName?: string;
  active?: boolean;
  enabled?: boolean;
}
