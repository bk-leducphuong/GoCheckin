import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsString()
  @IsOptional()
  deviceInfo?: string;
}
