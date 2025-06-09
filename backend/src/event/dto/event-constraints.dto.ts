import { IsOptional, IsString } from 'class-validator';
import { EventStatus, EventType } from '../entities/event.entity';

export class EventConstraintsDto {
  @IsString()
  @IsOptional()
  eventStatus?: EventStatus;

  @IsString()
  @IsOptional()
  eventType?: EventType;
}
