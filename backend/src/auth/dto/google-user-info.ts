import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleUserInfo {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  given_name: string;
}
