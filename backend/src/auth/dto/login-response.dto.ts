import { IsString, IsOptional } from 'class-validator';

export class AuthLoginResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  @IsOptional()
  pointCode?: string;

  @IsString()
  @IsOptional()
  eventCode?: string;

  @IsString()
  userId: string;
}
