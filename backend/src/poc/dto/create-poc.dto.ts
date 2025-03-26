import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  //   IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  @IsNotEmpty()
  @ApiProperty({ description: 'Event code this point belongs to' })
  eventCode: string;

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
  @Min(-90)
  @Max(90)
  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  longitude?: number;

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

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ description: 'Opening time of the point' })
  openTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ description: 'Closing time of the point' })
  closeTime?: Date;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the location' })
  locationDescription?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Floor level of the point' })
  floorLevel?: string;
}
