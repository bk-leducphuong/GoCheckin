import { IsString, IsNotEmpty } from 'class-validator';

export class InvitePocUserDto {
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @IsString()
  @IsNotEmpty()
  pocCode: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
