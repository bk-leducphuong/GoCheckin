import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestResetPassword {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
