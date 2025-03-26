import { IsObject, IsString, IsOptional } from 'class-validator';

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  pocId?: string;
}

export class AuthLoginResponseDto {
  @IsString()
  accessToken: string;

  @IsObject()
  user: User;

  @IsString()
  @IsOptional()
  pocId?: string;
}
