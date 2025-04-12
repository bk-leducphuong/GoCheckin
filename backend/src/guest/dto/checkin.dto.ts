import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckinDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Guest code to check in' })
  guestCode: string;

  @IsString()
  @ApiProperty({
    description: 'Point of check-in code',
  })
  pointCode: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Event code' })
  eventCode: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Additional notes about the check-in' })
  notes?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Image of the guest' })
  imageUrl?: string;
}
