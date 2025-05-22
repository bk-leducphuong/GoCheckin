import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GoogleAdminRegisterDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  tenantCode: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  deviceInfo?: string;
}
