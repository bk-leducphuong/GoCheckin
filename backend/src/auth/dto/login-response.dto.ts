import { IsObject, IsString, IsOptional } from 'class-validator';

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  pocId?: string;
  eventCode?: string;
}

export class AuthLoginResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  // @IsObject()
  // user: User;

  @IsString()
  @IsOptional()
  pocId?: string;

  @IsString()
  @IsOptional()
  eventCode?: string;
}
