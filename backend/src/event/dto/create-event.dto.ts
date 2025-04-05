import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  tenantCode?: string;

  @IsString()
  @IsOptional()
  eventDescription?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  eventStatus?: EventStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;

  @IsOptional()
  eventImg?: Buffer;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  venueAddress?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  termsConditions?: string;

  @IsOptional()
  floorPlanImg?: Buffer;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
