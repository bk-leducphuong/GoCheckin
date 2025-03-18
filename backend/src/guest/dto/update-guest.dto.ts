import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IdentityType, GuestType } from '../entities/guest.entity';

export class UpdateGuestDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the guest' })
  guestDescription?: string;

  @IsEnum(IdentityType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Type of identity document',
    enum: IdentityType,
  })
  identityType?: IdentityType;

  @IsEnum(GuestType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Type of guest',
    enum: GuestType,
  })
  guestType?: GuestType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Age range of the guest' })
  ageRange?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Gender of the guest' })
  gender?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ description: 'Registration date of the guest' })
  registrationDate?: Date;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Whether the guest is enabled' })
  enabled?: boolean;
}
