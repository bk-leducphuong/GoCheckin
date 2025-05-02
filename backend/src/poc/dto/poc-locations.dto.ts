import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class PocLocationDto {
  @IsNotEmpty()
  @IsString()
  pocId: string;
  @IsString()
  label: string;
  @IsNotEmpty()
  @IsNumber()
  xCoordinate: number;
  @IsNotEmpty()
  @IsNumber()
  yCoordinate: number;
}

export class PocLocationsDto {
  @IsNotEmpty()
  @IsString()
  eventCode: string;
  @IsArray()
  locations: PocLocationDto[];
}
