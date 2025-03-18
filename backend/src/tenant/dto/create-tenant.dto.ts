import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Unique tenant code' })
  tenantCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tenant address' })
  tenantAddress: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Tenant website' })
  website?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Contact person name' })
  contactName?: string;

  @IsString()
  @IsPhoneNumber('VN')
  @IsOptional()
  @ApiPropertyOptional({ description: 'Contact phone number' })
  contactPhone?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Contact email address' })
  contactEmail?: string;
}
