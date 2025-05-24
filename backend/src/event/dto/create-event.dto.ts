import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccessType, EventStatus, EventType } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  eventDescription: string;

  @IsEnum(EventStatus)
  @IsNotEmpty()
  eventStatus: EventStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;

  @IsString()
  @IsNotEmpty()
  venueName: string;

  @IsString()
  @IsNotEmpty()
  venueAddress: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  eventType: EventType;

  @IsString()
  @IsNotEmpty()
  termsConditions: string;

  @IsEnum(AccessType)
  @IsNotEmpty()
  accessType: AccessType;

  @IsArray()
  @IsNotEmpty()
  images: string[];
}
