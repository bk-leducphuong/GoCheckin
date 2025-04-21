import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PointStatus } from '../entities/poc.entity';

export class UpdatePocDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Name of the point of check-in' })
  pointName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Code of the point of check-in' })
  pointCode?: string;

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
