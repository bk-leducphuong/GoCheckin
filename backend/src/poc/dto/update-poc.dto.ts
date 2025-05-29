import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the location' })
  locationDescription?: string;
}
