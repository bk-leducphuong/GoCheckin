import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
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
  @MinLength(5)
  password: string;

  @ApiProperty({ example: 'POC', description: 'User role' })
  @IsEnum(UserRole)
  role: UserRole = UserRole.POC; // Default to POC
}
