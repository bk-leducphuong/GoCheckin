import { IsObject, IsString } from 'class-validator';

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  eventCode?: string;
  pointCode?: string;
}

export class AuthLoginResponseDto {
  @IsString()
  accessToken: string;

  @IsObject()
  user: User;

  @IsString()
  eventCode?: string;

  @IsString()
  pointCode?: string;
}
