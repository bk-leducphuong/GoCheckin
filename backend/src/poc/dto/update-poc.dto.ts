import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PocStatus } from '../entities/poc.entity';

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
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({ description: 'Capacity of the point' })
  capacity?: number;

  @IsEnum(PocStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Status of the point',
    enum: PocStatus,
  })
  status?: PocStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Description of the location' })
  locationDescription?: string;
}
