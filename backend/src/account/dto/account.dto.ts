import { UserRole } from '../entities/account.entity';
import { IsString, IsEmail, IsOptional, IsEnum, IsDate } from 'class-validator';

export class AccountDto {
  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
