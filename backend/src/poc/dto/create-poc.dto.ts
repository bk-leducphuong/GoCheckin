import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PointStatus } from '../entities/poc.entity';

export class CreatePocDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Unique code for the point of check-in' })
  pointCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the point of check-in' })
  pointName: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'UserId of the staff managing this point',
  })
  userId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Additional notes about the point' })
  pointNote?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({ description: 'Capacity of the point' })
  capacity?: number;

  @IsEnum(PointStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status of the point',
    enum: PointStatus,
    default: PointStatus.ACTIVE,
  })
  status?: PointStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the location' })
  locationDescription?: string;
}
