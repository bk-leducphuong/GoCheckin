import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../account/entities/account.entity';

export class CreateTenantMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Username for the tenant member' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Password for the tenant member' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Full name of the tenant member' })
  fullName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email address of the tenant member' })
  email: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Phone number of the tenant member' })
  phoneNumber?: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Role of the tenant member',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tenant code to associate with this member' })
  tenantCode: string;
}
