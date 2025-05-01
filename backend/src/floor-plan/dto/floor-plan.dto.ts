import { IsString } from 'class-validator';

export class FloorPlanDto {
  @IsString()
  eventCode: string;
  @IsString()
  floorPlanImageUrl: string;
}
