import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class GoogleAdminLoginDto {
  @ApiProperty({ example: 'deviceInfo', description: 'Device info' })
  @IsString()
  @IsOptional()
  deviceInfo?: string;

  @ApiProperty({ example: 'code', description: 'Code' })
  @IsString()
  code: string;
}
