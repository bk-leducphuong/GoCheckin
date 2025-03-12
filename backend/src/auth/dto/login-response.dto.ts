import { IsString } from 'class-validator';

export class AuthLoginResponseDto {
  @IsString()
  accessToken: string;
}
