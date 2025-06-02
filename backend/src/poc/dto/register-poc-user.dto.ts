import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterPocUserDto {
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @IsString()
  @IsNotEmpty()
  pocCode: string;
}
