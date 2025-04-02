import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatePocDto {
  @ApiProperty({ description: 'Event code' })
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @ApiProperty({ description: 'Point of check-in ID or code' })
  @IsString()
  @IsNotEmpty()
  pocId: string;
}
