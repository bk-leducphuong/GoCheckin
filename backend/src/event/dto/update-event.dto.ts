import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventType } from '../entities/event.entity';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  eventName?: string;

  @IsString()
  @IsOptional()
  eventCode?: string;

  @IsString()
  @IsOptional()
  eventDescription?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  eventStatus?: EventStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;

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
  eventType?: EventType;

  @IsString()
  @IsOptional()
  termsConditions?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
