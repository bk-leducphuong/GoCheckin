import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthAdminRegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'admin@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(5)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number (required for admin)',
  })
  @IsString()
  phoneNumber: string; // Required for admin

  @ApiProperty({ example: 'ADMIN', description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole = UserRole.ADMIN; // Default to ADMIN

  @ApiProperty({ example: 'ACME Corp', description: 'Company name' })
  @IsNotEmpty()
  @IsString()
  tenantName: string;

  @ApiProperty({ example: 'ACME', description: 'Company code' })
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  tenantCode: string;

  @ApiProperty({ example: 'deviceInfo', description: 'Device info' })
  @IsString()
  @IsOptional()
  deviceInfo?: string;
}
