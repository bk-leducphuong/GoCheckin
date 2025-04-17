import {
  IsString,
  IsOptional,
  MinLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
