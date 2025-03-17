import { IsPhoneNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @IsString()
  @ApiPropertyOptional()
  tenantAddress?: string;

  @IsString()
  @ApiPropertyOptional()
  website?: string;

  @IsString()
  @ApiPropertyOptional()
  contactName?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsPhoneNumber('VN')
  contactPhone?: string;

  @IsString()
  @ApiPropertyOptional()
  contactEmail?: string;
}
