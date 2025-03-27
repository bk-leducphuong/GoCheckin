import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IdentityType, GuestType } from '../entities/guest.entity';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Guest code' })
  guestCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Event code' })
  eventCode: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Image URL of the guest' })
  imageUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the guest' })
  description?: string;

  @IsEnum(IdentityType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Type of identity document',
    enum: IdentityType,
    default: IdentityType.ID_CARD,
  })
  identityType: IdentityType;

  @IsEnum(GuestType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Type of guest',
    enum: GuestType,
    default: GuestType.REGULAR,
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
  @ApiPropertyOptional({
    description: 'Whether the guest is enabled',
    default: true,
  })
  enabled?: boolean;
}
