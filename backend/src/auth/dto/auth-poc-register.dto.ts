import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPocRegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'poc@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    example: 'EVENT123',
    description: 'Event code (required for POC)',
  })
  @IsString()
  eventCode: string; // Required for POC

  @ApiProperty({ example: 'POC', description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole = UserRole.POC; // Default to POC

  @ApiProperty({ example: 'ACME Corp', description: 'Company name' })
  @IsOptional()
  @IsString()
  companyName?: string;
}
