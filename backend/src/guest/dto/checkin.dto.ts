import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckinDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Guest code to check in' })
  guestCode: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Point of check-in ID. If not provided, will use the current point from route params.',
  })
  pocId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Additional notes about the check-in' })
  notes?: string;
}
