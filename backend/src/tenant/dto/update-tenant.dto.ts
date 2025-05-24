import { IsString, IsPhoneNumber, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Unique tenant code' })
  tenantCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Tenant name' })
  tenantName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Tenant address' })
  tenantAddress?: string;

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
